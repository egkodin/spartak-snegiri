import catalogue from '../icons8.json';
import { assetPath } from './assetPath';

type IconName = keyof typeof catalogue.icons.items;
export default function Icon({ name, size = 24, className = '' }: { name: IconName; size?: number; className?: string }) {
  const url = assetPath(`icons/${name}.png`);
  return <span aria-hidden="true" className={`icon icon-${name} ${className}`} style={{ width: size, height: size, maskImage: `url("${url}")`, WebkitMaskImage: `url("${url}")` }}/>;
}
