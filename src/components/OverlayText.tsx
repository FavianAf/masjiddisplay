import { parseMediaName } from '@/lib/mediaUtils';

interface Props {
  media_name: string;
}

export default function OverlayText({ media_name }: Props) {
  const { title, subtitle } = parseMediaName(media_name);

  return (
    <div className="absolute bottom-12 left-12 right-12">
      <div className="glass inline-block px-8 py-4 rounded-2xl">
        <h3 className="text-3xl font-bold">{title}</h3>
        <p className="text-white/70 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}
