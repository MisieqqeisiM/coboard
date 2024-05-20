export default function IconCircle(
  { iconName, onClick, color }: {
    iconName: string;
    color?: string;
    onClick?: () => void;
  },
) {
  if (iconName == "eraser") {
    return (
      <div
        class="icon-circle"
        onClick={onClick}
        style={{ color }}
      >
        <img
          class="invertable"
          style={{ marginLeft: -0.5, marginTop: -1 }}
          src="/icons/eraser.svg"
          width="33"
          height="33"
        />
      </div>
    );
  }
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
