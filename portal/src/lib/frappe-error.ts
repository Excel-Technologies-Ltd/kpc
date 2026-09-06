import type { FrappeError } from 'frappe-react-sdk';

function stripHtmlTags(value: string) {
  return value.replace(/<[^>]*>/g, '').trim();
}

export function extractFrappeError(error: FrappeError) {
  let errorMessage = 'Something went wrong';

  if (error._server_messages) {
    try {
      const parsedMessages = JSON.parse(error._server_messages || '');
      if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
        const firstMessage = JSON.parse(parsedMessages[0]);
        errorMessage = firstMessage?.message || error.exception || 'Something went wrong';
      }
    } catch {
      errorMessage = error.exception || 'Something went wrong';
    }
  } else {
    errorMessage = error?.message || error?.exception || 'Something went wrong';
  }

  return stripHtmlTags(errorMessage);
}
