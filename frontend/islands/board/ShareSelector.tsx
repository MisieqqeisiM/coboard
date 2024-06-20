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
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = 'Link copied to clipboard!';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 2000);
  };

  return (
    <IconCircle iconName="share-social-outline" onClick={generateShareLink} />
  );
}
