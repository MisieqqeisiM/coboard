import IconCircle from "../app/IconCircle.tsx";

export default function ShareSelector({
  shareToken,
}: {
  shareToken: string | undefined;
}) {
  const generateShareLink = () => {
    navigator.clipboard.writeText(
      window.location.href + "&shareToken=" + (shareToken ? shareToken : "")
    );
  };

  return (
    <IconCircle iconName="share-social-outline" onClick={generateShareLink} />
  );
}
