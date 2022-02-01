import { Request, Response } from 'express';
import commentService from '../../../services/comment';

const getComment = async (req: Request, res: Response) => {
  try {
    const { studyid } = req.params;
    const comments = await commentService.getAllByStudy(studyid);

    return res.status(200).json({
      message: '문의글 목록 조회 성공',
      comments,
    });
  } catch (e) {
    return res.status(404).json({ message: (e as Error).message });
  }
};

const createComment = async (req: Request, res: Response) => {
  const BAD_REQUEST = '요청값이 유효하지 않음';

  try {
    const { studyid } = req.params;
    const { content, replyTo } = req.body;
    const { id } = req.user as { id: string };

    if (!content) throw new Error(BAD_REQUEST);

    const commentId = await commentService.createComment(studyid, req.body, id);

    return res.status(201).json({
      message: '문의글 생성 성공',
      commentId,
    });
  } catch (e) {
    if ((e as Error).message === BAD_REQUEST) {
      return res.status(400).json({ message: (e as Error).message });
    } else {
      return res.status(404).json({ message: (e as Error).message });
    }
  }
};

const updateComment = async (req: Request, res: Response) => {
  const BAD_REQUEST = '요청값이 유효하지 않음';

  try {
    const { commentid } = req.params;
    const { content } = req.body;

    if (!content) throw new Error(BAD_REQUEST);

    await commentService.updateComment(commentid, content);

    return res.status(200).json({ message: '문의글 수정 성공' });
  } catch (e) {
    if ((e as Error).message === BAD_REQUEST) {
      return res.status(400).json({ message: (e as Error).message });
    } else {
      return res.status(404).json({ message: (e as Error).message });
    }
  }
};

export default { getComment, createComment, updateComment };

/**
 * @swagger
 * paths:
 *  /study/:studyid/comment:
 *    get:
 *      summary: "스터디 문의글 목록 조회"
 *      description: "해당 스터디의 문의글 목록을 조회하기 위한 엔드포인트입니다"
 *      tags:
 *      - study/comment
 *      parameters:
 *      - name: "studyid"
 *        in: "path"
 *        description: "문의글 목록을 조회할 스터디 id"
 *        required: true
 *        type: string
 *        format: uuid
 *      responses:
 *        200:
 *          description: "올바른 요청"
 *          schema:
 *            allOf:
 *            - type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "문의글 목록 조회 성공"
 *            - $ref: "#/definitions/Comment"
 *        404:
 *          description: "전달한 studyid가 데이터베이스에 없는 경우입니다"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "일치하는 studyid가 없음"
 *
 *    post:
 *      summary: "스터디 문의글 등록"
 *      description: "해당 스터디에 새로운 문의글을 등록하기 위한 엔드포인트입니다"
 *      tags:
 *      - study/comment
 *      parameters:
 *      - name: "studyid"
 *        in: "path"
 *        description: "문의글을 등록할 스터디 id"
 *        required: true
 *        type: string
 *        format: uuid
 *      - name: "comment_body"
 *        in: "body"
 *        description: "새롭게 등록할 문의글 정보를 포함한 객체"
 *        required: true
 *        schema:
 *          type: object
 *          properties:
 *            content:
 *              type: string
 *              description: "문의글의 내용"
 *            replyTo:
 *              type: string
 *              format: uuid
 *              description: "답변이 달린 문의글의 id (nestedCommentId와 동일)"
 *      responses:
 *        201:
 *          description: "올바른 요청"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "문의글 생성 성공"
 *              id:
 *                type: string
 *                format: uuid
 *                description: "생성된 문의글의 id"
 *        400:
 *          description: "요청값이 유효하지 않은 경우입니다"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "request is not valid"
 *        401:
 *          description: "로그인이 되어있지 않은 경우"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "로그인 필요"
 *        404:
 *          description: "전달한 studyid가 데이터베이스에 없는 경우입니다"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "일치하는 studyid가 없음"
 *
 *  /study/:studyid/comment/:commentid:
 *    patch:
 *      summary: "스터디 문의글 수정"
 *      description: "해당 스터디의 해당 문의글을 수정하기 위한 엔드포인트입니다"
 *      tags:
 *      - study/comment
 *      parameters:
 *      - name: "studyid"
 *        in: "path"
 *        description: "문의글을 수정할 스터디 id"
 *        required: true
 *        type: string
 *        format: uuid
 *      - name: "commentid"
 *        in: "path"
 *        description: "수정할 문의글 id"
 *        required: true
 *        type: string
 *        format: uuid
 *      - name: "comment_body"
 *        in: "body"
 *        description: "수정할 문의글 정보를 포함한 객체"
 *        required: true
 *        schema:
 *          type: object
 *          properties:
 *            content:
 *              type: string
 *              description: "수정할 문의글의 내용"
 *      responses:
 *        200:
 *          description: "올바른 요청"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "문의글 생성 성공"
 *        400:
 *          description: "요청값이 유효하지 않은 경우입니다"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "request is not valid"
 *        401:
 *          description: "로그인이 되어있지 않은 경우"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "로그인 필요"
 *        404:
 *          description: "전달한 studyid 또는 commentid가 데이터베이스에 없는 경우입니다"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "일치하는 studyid 또는 commentid가 없음"
 */
