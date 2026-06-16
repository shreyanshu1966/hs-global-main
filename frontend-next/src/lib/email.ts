import emailjs from '@emailjs/browser';

let emailJsInitialized = false;

export const initEmailJs = () => {
  if (emailJsInitialized) return;
  const publicKey = (import.meta as any).env.VITE_EMAILJS_PUBLIC_KEY || 'xBA-VAyjd8xdlmmZu';
  if (publicKey) {
    try {
      emailjs.init(publicKey);
      emailJsInitialized = true;
    } catch {}
  }
};

export const sendEmail = async (
  templateId: string,
  variables: Record<string, any>,
  serviceId?: string,
) => {
  initEmailJs();
  const svc = serviceId || (import.meta as any).env.VITE_EMAILJS_SERVICE_ID || 'service_6byqj89';
  const tpl = templateId;
  if (!svc || !tpl) throw new Error('EmailJS service/template not configured');
  return emailjs.send(svc, tpl, variables);
};







