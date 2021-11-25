import { Entity, BaseEntity, ManyToOne, JoinColumn } from 'typeorm';
import User from './UserEntity';
import Comment from './CommentEntity';

@Entity({ name: 'USER_METOO_COMMENT' })
export default class UserMetooComment extends BaseEntity {
  @ManyToOne((type) => User, (user) => user.id)
  @JoinColumn({ name: 'USER_ID' })
  userId!: User;

  @ManyToOne((type) => Comment, (comment) => comment.id)
  @JoinColumn({ name: 'COMMENT_ID' })
  commentId!: Comment;
}
