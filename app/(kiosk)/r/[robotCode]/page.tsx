import { KioskForm } from "./KioskForm";

interface Props { params: { robotCode: string } }

export default function KioskPage({ params }: Props) {
  return <KioskForm robotCode={params.robotCode} />;
}
