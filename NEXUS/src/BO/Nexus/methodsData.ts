import PACKAGE_DATA from "../../data/jsons/package-data.json";

export const SendMailValues = ({
  protoPath,
  target,
}: {
  protoPath: string;
  target: string;
}) => {
  const objectValue = {
    ...PACKAGE_DATA.sendMail,
    protoPath,
    target,
  };

  return objectValue;
};
