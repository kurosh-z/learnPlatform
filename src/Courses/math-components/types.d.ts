import Group, { GroupProps } from './Group';

interface TspanGroupElement {
  type: typeof Group;
  props: GroupProps;
  key: React.Key | null;
}
