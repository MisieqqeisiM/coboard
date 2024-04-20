export default function IconCircle(
  { iconName, onClick, color }: {
    iconName: string;
    color?: string;
    onClick?: () => void;
  },
) {
  return (
    <div
      class="icon-circle"
      onClick={onClick}
      style={{ color }}
      dangerouslySetInnerHTML={{
        __html: `<ion-icon name='${iconName}'></ion-icon>`,
      }}
    >
    </div>
  );
}
