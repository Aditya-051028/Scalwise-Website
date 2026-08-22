const MIN_SUBMIT_MS = 1500;

type SpamCheckInput = {
  website: string;
  formRenderedAt: number;
};

export function isSpamSubmission({ website, formRenderedAt }: SpamCheckInput): boolean {
  if (website.trim().length > 0) return true;
  if (Date.now() - formRenderedAt < MIN_SUBMIT_MS) return true;
  return false;
}
