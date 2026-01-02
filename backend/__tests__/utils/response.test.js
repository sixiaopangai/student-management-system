const Response = require('../../src/utils/response');
const { ErrorCodes } = require('../../src/config/errorCodes');

describe('Response', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('success', () => {
    it('应该返回成功响应', () => {
      const data = { id: 1, name: 'test' };
      Response.success(mockRes, data);

      expect(mockRes.json).toHaveBeenCalledWith({
        code: ErrorCodes.SUCCESS,
        message: '操作成功',
        data
      });
    });

    it('应该返回自定义消息的成功响应', () => {
      const data = { id: 1 };
      const message = '创建成功';
      Response.success(mockRes, data, message);

      expect(mockRes.json).toHaveBeenCalledWith({
        code: ErrorCodes.SUCCESS,
        message,
        data
      });
    });

    it('data 为 null 时应该正常返回', () => {
      Response.success(mockRes, null, '删除成功');

      expect(mockRes.json).toHaveBeenCalledWith({
        code: ErrorCodes.SUCCESS,
        message: '删除成功',
        data: null
      });
    });
  });

  describe('error', () => {
    it('应该返回错误响应', () => {
      Response.error(mockRes, ErrorCodes.USER_NOT_FOUND);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        code: ErrorCodes.USER_NOT_FOUND,
        message: '用户不存在',
        data: null
      });
    });

    it('应该返回自定义消息的错误响应', () => {
      const customMessage = '找不到指定用户';
      Response.error(mockRes, ErrorCodes.USER_NOT_FOUND, customMessage);

      expect(mockRes.json).toHaveBeenCalledWith({
        code: ErrorCodes.USER_NOT_FOUND,
        message: customMessage,
        data: null
      });
    });

    it('认证错误应该返回 401 状态码', () => {
      Response.error(mockRes, ErrorCodes.NO_PERMISSION);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('Token 过期应该返回 401 状态码', () => {
      Response.error(mockRes, ErrorCodes.TOKEN_EXPIRED);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('权限错误应该返回 403 状态码', () => {
      Response.error(mockRes, ErrorCodes.ROLE_MISMATCH);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('验证错误应该返回 400 状态码', () => {
      Response.error(mockRes, ErrorCodes.VALIDATION_ERROR);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('系统错误应该返回 500 状态码', () => {
      Response.error(mockRes, ErrorCodes.SYSTEM_ERROR);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it('应该能附加额外数据', () => {
      const extraData = { field: 'username', reason: 'required' };
      Response.error(mockRes, ErrorCodes.VALIDATION_ERROR, null, extraData);

      expect(mockRes.json).toHaveBeenCalledWith({
        code: ErrorCodes.VALIDATION_ERROR,
        message: '参数校验失败',
        data: extraData
      });
    });
  });

  describe('paginate', () => {
    it('应该返回分页数据响应', () => {
      const list = [{ id: 1 }, { id: 2 }];
      const total = 100;
      const page = 1;
      const pageSize = 10;

      Response.paginate(mockRes, list, total, page, pageSize);

      expect(mockRes.json).toHaveBeenCalledWith({
        code: ErrorCodes.SUCCESS,
        message: '获取成功',
        data: {
          list,
          pagination: {
            total,
            page,
            pageSize,
            totalPages: 10
          }
        }
      });
    });

    it('应该正确计算总页数', () => {
      const list = [];
      Response.paginate(mockRes, list, 25, 1, 10);

      const call = mockRes.json.mock.calls[0][0];
      expect(call.data.pagination.totalPages).toBe(3);
    });

    it('总数为 0 时总页数应该为 0', () => {
      const list = [];
      Response.paginate(mockRes, list, 0, 1, 10);

      const call = mockRes.json.mock.calls[0][0];
      expect(call.data.pagination.totalPages).toBe(0);
    });
  });

  describe('batch', () => {
    it('应该返回全部成功的批量操作响应', () => {
      const results = [{ id: 1, success: true }, { id: 2, success: true }];
      Response.batch(mockRes, 2, 0, results);

      expect(mockRes.json).toHaveBeenCalledWith({
        code: ErrorCodes.SUCCESS,
        message: '批量操作完成：共 2 条',
        data: {
          success: 2,
          failed: 0,
          results
        }
      });
    });

    it('应该返回部分成功的批量操作响应', () => {
      const results = [
        { id: 1, success: true },
        { id: 2, success: false, error: '操作失败' }
      ];
      Response.batch(mockRes, 1, 1, results);

      expect(mockRes.json).toHaveBeenCalledWith({
        code: ErrorCodes.SUCCESS,
        message: '批量操作部分完成：成功 1 条，失败 1 条',
        data: {
          success: 1,
          failed: 1,
          results
        }
      });
    });
  });
});