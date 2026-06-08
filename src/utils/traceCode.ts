export function validateTraceCode(code: string): { valid: boolean; message?: string } {
  if (!code) {
    return { valid: false, message: '请输入追溯码' };
  }

  if (code.length !== 20) {
    return { valid: false, message: '追溯码必须为20位数字' };
  }

  if (!/^\d+$/.test(code)) {
    return { valid: false, message: '追溯码只能包含数字' };
  }

  if (!code.startsWith('81')) {
    return { valid: false, message: '追溯码必须以81开头' };
  }

  const first19 = code.substring(0, 19);
  const checkDigit = parseInt(code.charAt(19), 10);
  let sum = 0;
  for (let i = 0; i < 19; i++) {
    const digit = parseInt(first19.charAt(i), 10);
    const weight = i % 2 === 0 ? 3 : 1;
    sum += digit * weight;
  }
  const calculatedCheck = (10 - (sum % 10)) % 10;

  if (calculatedCheck !== checkDigit) {
    return { valid: false, message: '追溯码校验位验证失败' };
  }

  return { valid: true };
}

export function generateMockCode(): string {
  let code = '81';
  for (let i = 0; i < 17; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }

  let sum = 0;
  for (let i = 0; i < 19; i++) {
    const digit = parseInt(code.charAt(i), 10);
    const weight = i % 2 === 0 ? 3 : 1;
    sum += digit * weight;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  code += checkDigit.toString();

  return code;
}
