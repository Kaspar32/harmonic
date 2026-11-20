


export async function sendEmail(subject: string, html: string, to: string = 't1@marcobrunold.ch') {
  const emailData = { to, subject, html };
  
  try {
    await fetch('/api/send-mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
}


export function generateEasyPassword(): string {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let password = '';

  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    password += digits[randomIndex];
  }

  return password;
}

export function generateRandomString(length: number): string {
  const characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
