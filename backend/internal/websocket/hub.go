package websocket

import (
	"encoding/json"
	"log"
	"sync"
)

// Message represents standard websocket envelope
type WSMessage struct {
	Topic   string          `json:"topic"`
	Payload json.RawMessage `json:"payload"`
}

// ClientSubscription defines subscription command from client
type SubscriptionRequest struct {
	Action string `json:"action"` // "subscribe" or "unsubscribe"
	Topic  string `json:"topic"`  // e.g. "ticker:BTCUSDT", "orderbook:BTCUSDT"
}

// Hub manages active WebSocket clients and broadcast channels
type Hub struct {
	// Registered clients mapped by client pointer
	clients map[*Client]bool

	// Clients mapped by topic (e.g. "ticker:BTCUSDT" -> map[*Client]bool)
	topicSubscribers map[string]map[*Client]bool

	// Clients mapped by user ID for private messages (e.g. order execution)
	userClients map[string]map[*Client]bool

	// Inbound messages from clients
	broadcast chan *WSMessage

	// Register requests from clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client

	// Subscribe/unsubscribe requests
	subscribe   chan *TopicRequest
	unsubscribe chan *TopicRequest

	mu sync.RWMutex
}

type TopicRequest struct {
	Client *Client
	Topic  string
}

func NewHub() *Hub {
	return &Hub{
		clients:          make(map[*Client]bool),
		topicSubscribers: make(map[string]map[*Client]bool),
		userClients:      make(map[string]map[*Client]bool),
		broadcast:        make(chan *WSMessage, 2048),
		register:         make(chan *Client, 256),
		unregister:       make(chan *Client, 256),
		subscribe:        make(chan *TopicRequest, 512),
		unsubscribe:      make(chan *TopicRequest, 512),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			if client.UserID != "" {
				if h.userClients[client.UserID] == nil {
					h.userClients[client.UserID] = make(map[*Client]bool)
				}
				h.userClients[client.UserID][client] = true
			}
			h.mu.Unlock()
			log.Printf("[WS Hub] Client registered: %s (User: %s)", client.Conn.RemoteAddr(), client.UserID)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)

				// Remove from user mapping
				if client.UserID != "" && h.userClients[client.UserID] != nil {
					delete(h.userClients[client.UserID], client)
					if len(h.userClients[client.UserID]) == 0 {
						delete(h.userClients, client.UserID)
					}
				}

				// Remove from all topics
				for topic := range client.subscriptions {
					if subs, exists := h.topicSubscribers[topic]; exists {
						delete(subs, client)
						if len(subs) == 0 {
							delete(h.topicSubscribers, topic)
						}
					}
				}
			}
			h.mu.Unlock()
			log.Printf("[WS Hub] Client unregistered: %s", client.Conn.RemoteAddr())

		case req := <-h.subscribe:
			h.mu.Lock()
			if h.topicSubscribers[req.Topic] == nil {
				h.topicSubscribers[req.Topic] = make(map[*Client]bool)
			}
			h.topicSubscribers[req.Topic][req.Client] = true
			req.Client.subscriptions[req.Topic] = true
			h.mu.Unlock()

		case req := <-h.unsubscribe:
			h.mu.Lock()
			if subs, exists := h.topicSubscribers[req.Topic]; exists {
				delete(subs, req.Client)
			}
			delete(req.Client.subscriptions, req.Topic)
			h.mu.Unlock()

		case msg := <-h.broadcast:
			h.dispatchMessage(msg)
		}
	}
}

func (h *Hub) dispatchMessage(msg *WSMessage) {
	data, err := json.Marshal(msg)
	if err != nil {
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	// Broadcast to clients subscribed to this topic
	if subs, exists := h.topicSubscribers[msg.Topic]; exists {
		for client := range subs {
			select {
			case client.send <- data:
			default:
				// Buffer full, drop or close to prevent blocking hub
			}
		}
	}
}

// BroadcastToTopic sends data to all clients subscribed to a given topic
func (h *Hub) BroadcastToTopic(topic string, payload interface{}) {
	bytes, err := json.Marshal(payload)
	if err != nil {
		log.Printf("[WS Hub] Error marshaling payload: %v", err)
		return
	}

	h.broadcast <- &WSMessage{
		Topic:   topic,
		Payload: bytes,
	}
}

// Broadcast sends message to topic
func (h *Hub) Broadcast(topic string, payload interface{}) {
	h.BroadcastToTopic(topic, payload)
}

// BroadcastToUser sends private event to all active sessions of a specific user
func (h *Hub) BroadcastToUser(userID string, eventType string, payload interface{}) {
	bytes, err := json.Marshal(payload)
	if err != nil {
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	clients, exists := h.userClients[userID]
	if !exists {
		return
	}

	msgBytes, _ := json.Marshal(&WSMessage{
		Topic:   "user:" + eventType,
		Payload: bytes,
	})

	for client := range clients {
		select {
		case client.send <- msgBytes:
		default:
		}
	}
}

// RegisterClient queues client for registration in Hub
func (h *Hub) RegisterClient(client *Client) {
	h.register <- client
}

// UnregisterClient queues client for removal from Hub
func (h *Hub) UnregisterClient(client *Client) {
	h.unregister <- client
}

