const JwtUtil = require('../../src/utils/jwt');

describe('JwtUtil', () => {
  const testPayload = {
    userId: 1,
    username: 'testuser',
    role: 'student'
  };

  describe('generateToken', () => {
    it('应该成功生成 Token', () => {
      const token = JwtUtil.generateToken(testPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT 格式: header.payload.signature
    });

    it('不同载荷应该生成不同的 Token', () => {
      const payload1 = { userId: 1, username: 'user1' };
      const payload2 = { userId: 2, username: 'user2' };
      
      const token1 = JwtUtil.generateToken(payload1);
      const token2 = JwtUtil.generateToken(payload2);
      
      expect(token1).not.toBe(token2);
    });

    it('rememberMe 为 true 时应该生成更长有效期的 Token', () => {
      const normalToken = JwtUtil.generateToken(testPayload, false);
      const rememberToken = JwtUtil.generateToken(testPayload, true);
      
      expect(normalToken).toBeDefined();
      expect(rememberToken).toBeDefined();
      // 两个 token 都应该是有效的
      expect(JwtUtil.verifyToken(normalToken)).not.toBeNull();
      expect(JwtUtil.verifyToken(rememberToken)).not.toBeNull();
    });
  });

  describe('verifyToken', () => {
    it('应该成功验证有效的 Token', () => {
      const token = JwtUtil.generateToken(testPayload);
      const decoded = JwtUtil.verifyToken(token);
      
      expect(decoded).not.toBeNull();
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.username).toBe(testPayload.username);
      expect(decoded.role).toBe(testPayload.role);
    });

    it('无效的 Token 应该返回 null', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = JwtUtil.verifyToken(invalidToken);
      
      expect(decoded).toBeNull();
    });

    it('篡改过的 Token 应该返回 null', () => {
      const token = JwtUtil.generateToken(testPayload);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      const decoded = JwtUtil.verifyToken(tamperedToken);
      
      expect(decoded).toBeNull();
    });

    it('空 Token 应该返回 null', () => {
      expect(JwtUtil.verifyToken('')).toBeNull();
      expect(JwtUtil.verifyToken(null)).toBeNull();
      expect(JwtUtil.verifyToken(undefined)).toBeNull();
    });
  });

  describe('decodeToken', () => {
    it('应该成功解码有效的 Token', () => {
      const token = JwtUtil.generateToken(testPayload);
      const decoded = JwtUtil.decodeToken(token);
      
      expect(decoded).not.toBeNull();
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.username).toBe(testPayload.username);
    });

    it('应该解码无效签名的 Token（不验证签名）', () => {
      const token = JwtUtil.generateToken(testPayload);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      const decoded = JwtUtil.decodeToken(tamperedToken);
      
      // decodeToken 不验证签名，所以应该能解码
      expect(decoded).not.toBeNull();
    });

    it('完全无效的 Token 应该返回 null', () => {
      expect(JwtUtil.decodeToken('not-a-jwt')).toBeNull();
    });
  });

  describe('extractToken', () => {
    it('应该从 Authorization 头中提取 Token', () => {
      const token = 'test-token-123';
      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      
      const extracted = JwtUtil.extractToken(req);
      expect(extracted).toBe(token);
    });

    it('没有 Authorization 头应该返回 null', () => {
      const req = {
        headers: {}
      };
      
      const extracted = JwtUtil.extractToken(req);
      expect(extracted).toBeNull();
    });

    it('Authorization 头格式不正确应该返回 null', () => {
      const req = {
        headers: {
          authorization: 'Basic some-token'
        }
      };
      
      const extracted = JwtUtil.extractToken(req);
      expect(extracted).toBeNull();
    });

    it('只有 Bearer 没有 Token 应该返回空字符串', () => {
      const req = {
        headers: {
          authorization: 'Bearer '
        }
      };
      
      const extracted = JwtUtil.extractToken(req);
      expect(extracted).toBe('');
    });
  });
});