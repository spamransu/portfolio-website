import type { IconType } from 'react-icons'

type AdminIconProps = {
  icon: IconType
}

export const AdminIcon = ({ icon: Icon }: AdminIconProps) => (
  <Icon aria-hidden="true" className="admin-icon" focusable="false" />
)
