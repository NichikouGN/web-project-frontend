export const formatConsoleError = (file: string, functionName: string, message: any): void => {
  const formattedMessage = `[${file} - ${functionName}]: ${message}`;
  console.error(formattedMessage);
};
