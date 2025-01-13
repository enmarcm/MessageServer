export const SendMailValues = ({
  protoPath,
  target,
}: {
  protoPath: string;
  target: string;
}) => {
  const objectValue = {
    protoPath,
    packageName: "mail",
    serviceName: "MailService",
    methodName: "SendMail",
    target,
  };

  return objectValue;
};
