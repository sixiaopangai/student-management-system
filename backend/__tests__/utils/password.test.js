const PasswordUtil = require('../../src/utils/password');

describe('PasswordUtil', () => {
  describe('hash', () => {
    it('应该成功加密密码', async () => {
      const password = 'testPassword123';
      const hashedPassword = await PasswordUtil.hash(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it('相同密码每次加密结果应该不同', async () => {
      const password = 'testPassword123';
      const hash1 = await PasswordUtil.hash(password);
      const hash2 = await PasswordUtil.hash(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('正确密码应该验证通过', async () => {
      const password = 'testPassword123';
      const hashedPassword = await PasswordUtil.hash(password);
      
      const isMatch = await PasswordUtil.compare(password, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('错误密码应该验证失败', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hashedPassword = await PasswordUtil.hash(password);
      
      const isMatch = await PasswordUtil.compare(wrongPassword, hashedPassword);
      expect(isMatch).toBe(false);
    });
  });

  describe('validateStrength', () => {
    it('密码长度小于6位应该返回无效', () => {
      const result = PasswordUtil.validateStrength('12345');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('密码长度不能少于6位');
    });

    it('密码长度超过20位应该返回无效', () => {
      const result = PasswordUtil.validateStrength('123456789012345678901');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('密码长度不能超过20位');
    });

    it('空密码应该返回无效', () => {
      const result = PasswordUtil.validateStrength('');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('密码长度不能少于6位');
    });

    it('null密码应该返回无效', () => {
      const result = PasswordUtil.validateStrength(null);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('密码长度不能少于6位');
    });

    it('有效密码应该返回有效', () => {
      const result = PasswordUtil.validateStrength('validPassword');
      expect(result.valid).toBe(true);
      expect(result.message).toBe('密码格式正确');
    });

    it('6位密码应该返回有效', () => {
      const result = PasswordUtil.validateStrength('123456');
      expect(result.valid).toBe(true);
    });

    it('20位密码应该返回有效', () => {
      const result = PasswordUtil.validateStrength('12345678901234567890');
      expect(result.valid).toBe(true);
    });
  });

  describe('generateRandom', () => {
    it('应该生成默认长度为8的随机密码', () => {
      const password = PasswordUtil.generateRandom();
      expect(password.length).toBe(8);
    });

    it('应该生成指定长度的随机密码', () => {
      const password = PasswordUtil.generateRandom(12);
      expect(password.length).toBe(12);
    });

    it('生成的密码应该只包含字母和数字', () => {
      const password = PasswordUtil.generateRandom(100);
      const validChars = /^[A-Za-z0-9]+$/;
      expect(validChars.test(password)).toBe(true);
    });

    it('每次生成的密码应该不同', () => {
      const password1 = PasswordUtil.generateRandom(20);
      const password2 = PasswordUtil.generateRandom(20);
      // 由于是随机的，极小概率会相同，但20位长度几乎不可能
      expect(password1).not.toBe(password2);
    });
  });
});