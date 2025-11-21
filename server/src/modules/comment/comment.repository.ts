import { Comment } from './comment.model.js';
import { IComment } from './comment.IComment.js';
import { Schema } from 'mongoose';

export class CommentRepository {
  async create(commentData: Partial<IComment>): Promise<IComment> {
    const comment = new Comment(commentData);
    return await comment.save();
  }

  async findById(id: string | Schema.Types.ObjectId): Promise<IComment | null> {
    return await Comment.findById(id)
      .populate("authorId", "name email")
      .populate("parentCommentId", "content authorId createdAt");
  }

  async findByTask(taskId: string | Schema.Types.ObjectId): Promise<IComment[]> {
    // Only get top-level comments (no parent)
    return await Comment.find({
      taskId,
      parentCommentId: { $exists: false }
    })
      .populate("authorId", "name email")
      .sort({ createdAt: -1 });
  }

  async findReplies(
    parentCommentId: string | Schema.Types.ObjectId
  ): Promise<IComment[]> {
    return await Comment.find({ parentCommentId })
      .populate("authorId", "name email")
      .sort({ createdAt: 1 }); // Chronological order for replies
  }

  async findThreadWithReplies(taskId: string | Schema.Types.ObjectId): Promise<any[]> {
    // Get all comments for the task
    const allComments = await Comment.find({ taskId })
      .populate("authorId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // Build a map for quick lookup
    const commentMap = new Map();
    const rootComments: any[] = [];

    // Initialize all comments with empty replies array
    allComments.forEach(comment => {
      commentMap.set(comment._id.toString(), { ...comment, replies: [] });
    });

    // Build the tree structure
    allComments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment._id.toString());
      
      if (comment.parentCommentId) {
        // This is a reply, add it to parent's replies
        const parent = commentMap.get(comment.parentCommentId.toString());
        if (parent) {
          parent.replies.push(commentWithReplies);
        }
      } else {
        // This is a root comment
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  }

  async update(
    id: string | Schema.Types.ObjectId,
    content: string
  ): Promise<IComment | null> {
    return await Comment.findByIdAndUpdate(
      id,
      {
        $set: {
          content,
          isEdited: true
        }
      },
      { new: true }
    )
      .populate("authorId", "name email");
  }

  async delete(id: string | Schema.Types.ObjectId): Promise<void> {
    // Delete the comment and all its replies
    await this.deleteCommentAndReplies(id);
  }

  private async deleteCommentAndReplies(
    commentId: string | Schema.Types.ObjectId
  ): Promise<void> {
    // Find all replies to this comment
    const replies = await Comment.find({ parentCommentId: commentId });

    // Recursively delete all replies
    for (const reply of replies) {
      await this.deleteCommentAndReplies(reply._id);
    }

    // Delete the comment itself
    await Comment.findByIdAndDelete(commentId);
  }

  async countByTask(taskId: string | Schema.Types.ObjectId): Promise<number> {
    return await Comment.countDocuments({ taskId });
  }

  async countReplies(
    parentCommentId: string | Schema.Types.ObjectId
  ): Promise<number> {
    return await Comment.countDocuments({ parentCommentId });
  }

  async findByAuthor(
    authorId: string | Schema.Types.ObjectId,
    workspaceId: string | Schema.Types.ObjectId
  ): Promise<IComment[]> {
    return await Comment.find({ authorId, workspaceId })
      .populate("taskId", "key title")
      .sort({ createdAt: -1 })
      .limit(50);
  }

  async findRecentComments(
    workspaceId: string | Schema.Types.ObjectId,
    limit: number = 20
  ): Promise<IComment[]> {
    return await Comment.find({ workspaceId })
      .populate("authorId", "name email")
      .populate("taskId", "key title")
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async searchComments(
    workspaceId: string | Schema.Types.ObjectId,
    searchTerm: string,
    taskId?: string
  ): Promise<IComment[]> {
    const query: any = {
      workspaceId,
      content: { $regex: searchTerm, $options: "i" }
    };

    if (taskId) {
      query.taskId = taskId;
    }

    return await Comment.find(query)
      .populate("authorId", "name email")
      .populate("taskId", "key title")
      .sort({ createdAt: -1 })
      .limit(50);
  }
}
