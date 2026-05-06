export default function Avatar({ user, size = 'md', style }) {
  const sizeMap = { sm: 32, md: 44, lg: 60, xl: 80, '2xl': 110 }
  const px = sizeMap[size] || 44
  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : '?'

  if (user?.profilePicture?.url) {
    return <img src={user.profilePicture.url} alt={initials} className={`avatar avatar-${size}`} style={{ width: px, height: px, ...style }} />
  }
  return (
    <div className="avatar-placeholder" style={{ width: px, height: px, fontSize: px * 0.38, ...style }}>
      {initials}
    </div>
  )
}
