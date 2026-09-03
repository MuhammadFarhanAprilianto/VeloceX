'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Cancel01Icon,
  SentIcon,
  BubbleChatIcon,
  ThumbsUpIcon,
  SparklesIcon,
} from 'hugeicons-react';

export interface FeedComment {
  id: string;
  author: string;
  avatar: string;
  badge?: string;
  time: string;
  content: string;
  likes: number;
  isLiked?: boolean;
}

interface FeedCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postAuthor: string;
  postContent: string;
  comments: FeedComment[];
  onAddComment: (postId: string, text: string) => void;
}

export const FeedCommentsModal: React.FC<FeedCommentsModalProps> = ({
  isOpen,
  onClose,
  postId,
  postAuthor,
  postContent,
  comments,
  onAddComment,
}) => {
  const [mounted, setMounted] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState<FeedComment[]>(comments);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  if (!isOpen || !mounted) return null;

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newC: FeedComment = {
      id: `c_${Date.now()}`,
      author: 'Anda (Trader)',
      avatar: 'ME',
      badge: 'PRO',
      time: 'Baru saja',
      content: commentText.trim(),
      likes: 0,
      isLiked: false,
    };

    setLocalComments([newC, ...localComments]);
    onAddComment(postId, commentText.trim());
    setCommentText('');
  };

  const handleToggleCommentLike = (commentId: string) => {
    setLocalComments(
      localComments.map((c) =>
        c.id === commentId
          ? {
              ...c,
              likes: c.isLiked ? c.likes - 1 : c.likes + 1,
              isLiked: !c.isLiked,
            }
          : c
      )
    );
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-[#1F1E25] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-6 flex flex-col gap-4 max-h-[90vh] overflow-hidden"
      >
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00E163] to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00E163]/10 border border-[#00E163]/30 flex items-center justify-center text-[#00E163]">
              <BubbleChatIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-extrabold text-white font-heading">
                Komentar Komunitas ({localComments.length})
              </h3>
              <span className="text-xs text-slate-400">
                Diskusi postingan dari <strong className="text-white">{postAuthor}</strong>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#26252E] hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Cancel01Icon className="w-4 h-4" />
          </button>
        </div>

        {/* Original Post Preview Quote */}
        <div className="p-3.5 rounded-2xl bg-[#18171E] border border-white/5 text-xs text-slate-300 italic line-clamp-2">
          &quot;{postContent}&quot;
        </div>

        {/* Comments Stream */}
        <div className="flex-1 overflow-y-auto custom-positions-scrollbar pr-1 space-y-3 min-h-[220px] max-h-[360px]">
          {localComments.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-2 text-slate-500">
              <BubbleChatIcon className="w-8 h-8 opacity-40" />
              <span className="text-xs">Belum ada komentar. Jadilah yang pertama memberikan pandangan!</span>
            </div>
          ) : (
            localComments.map((comment) => (
              <div
                key={comment.id}
                className="p-3.5 rounded-2xl bg-[#18171E] border border-white/5 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-[#26252E] border border-white/10 flex items-center justify-center text-[10px] font-black text-[#00E163]">
                      {comment.avatar}
                    </div>
                    <span className="text-xs font-bold text-white">{comment.author}</span>
                    {comment.badge && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#00E163]/10 text-[#00E163]">
                        {comment.badge}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500">• {comment.time}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleCommentLike(comment.id)}
                    className={`flex items-center gap-1 text-[11px] transition-colors cursor-pointer ${
                      comment.isLiked ? 'text-[#00E163] font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ThumbsUpIcon className="w-3.5 h-3.5" />
                    <span>{comment.likes}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-200 pl-9 leading-relaxed">{comment.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Input Form */}
        <form onSubmit={handleSubmitComment} className="flex items-center gap-2 pt-2 border-t border-white/5">
          <input
            type="text"
            required
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Tulis tanggapan atau analisis Anda..."
            className="flex-1 h-11 px-4 rounded-2xl bg-[#18171E] border border-white/10 focus:border-[#00E163]/60 text-xs font-medium text-white focus:outline-none transition-colors"
          />

          <button
            type="submit"
            disabled={!commentText.trim()}
            className="h-11 px-5 rounded-2xl bg-[#00E163] hover:bg-[#00c957] disabled:bg-slate-800 text-black disabled:text-slate-600 font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0"
          >
            <SentIcon className="w-3.5 h-3.5" />
            <span>Kirim</span>
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};
