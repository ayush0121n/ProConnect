import API from './api'

export const authService = {
  register: (data)       => API.post('/auth/register', data),
  login:    (data)       => API.post('/auth/login', data),
  logout:   ()           => API.post('/auth/logout'),
  getMe:    ()           => API.get('/auth/me'),
  forgotPassword: (email)=> API.post('/auth/forgot-password', { email }),
  resetPassword:  (token, password) => API.put(`/auth/reset-password/${token}`, { password }),
  verifyEmail:    (token)=> API.get(`/auth/verify-email/${token}`),
  changePassword: (data) => API.put('/auth/change-password', data),
}

export const userService = {
  getUsers:     (params) => API.get('/users', { params }),
  getUserById:  (id)     => API.get(`/users/${id}`),
  updateUser:   (id, data)=> API.put(`/users/${id}`, data),
  deleteUser:   (id)     => API.delete(`/users/${id}`),
  getUserPosts: (id, params) => API.get(`/users/${id}/posts`, { params }),
  getUserConnections: (id) => API.get(`/users/${id}/connections`),
  followUser:   (id)     => API.post(`/users/${id}/follow`),
  unfollowUser: (id)     => API.delete(`/users/${id}/follow`),
}

export const postService = {
  getPosts:    (params)  => API.get('/posts', { params }),
  getPost:     (id)      => API.get(`/posts/${id}`),
  createPost:  (data)    => API.post('/posts', data),
  updatePost:  (id, data)=> API.put(`/posts/${id}`, data),
  deletePost:  (id)      => API.delete(`/posts/${id}`),
  likePost:    (id)      => API.post(`/posts/${id}/like`),
  unlikePost:  (id)      => API.delete(`/posts/${id}/like`),
  addComment:  (id, text)=> API.post(`/posts/${id}/comment`, { text }),
  deleteComment:(id, cId)=> API.delete(`/posts/${id}/comment/${cId}`),
  getByHashtag:(tag, p)  => API.get(`/posts/hashtag/${tag}`, { params: p }),
}

export const jobService = {
  getJobs:     (params)  => API.get('/jobs', { params }),
  getJob:      (id)      => API.get(`/jobs/${id}`),
  createJob:   (data)    => API.post('/jobs', data),
  updateJob:   (id, data)=> API.put(`/jobs/${id}`, data),
  deleteJob:   (id)      => API.delete(`/jobs/${id}`),
  applyForJob: (id, data)=> API.post(`/jobs/${id}/apply`, data),
  getApplications:(id)   => API.get(`/jobs/${id}/applications`),
  updateAppStatus:(id, aId, status) => API.put(`/jobs/${id}/applications/${aId}`, { status }),
  saveJob:     (id)      => API.post(`/jobs/${id}/save`),
  unsaveJob:   (id)      => API.delete(`/jobs/${id}/save`),
  getSavedJobs:()        => API.get('/jobs/saved'),
  getMyApplications:()   => API.get('/jobs/my-applications'),
  getMyPosts:  ()        => API.get('/jobs/my-posts'),
}

export const connectionService = {
  getConnections:  ()    => API.get('/connections'),
  getRequests:     ()    => API.get('/connections/requests'),
  getSuggestions:  ()    => API.get('/connections/suggestions'),
  sendRequest:     (id, msg) => API.post(`/connections/send/${id}`, { message: msg }),
  acceptRequest:   (id)  => API.put(`/connections/accept/${id}`),
  rejectRequest:   (id)  => API.put(`/connections/reject/${id}`),
  removeConnection:(id)  => API.delete(`/connections/${id}`),
}

export const messageService = {
  getConversations:()    => API.get('/messages/conversations'),
  getMessages:  (convId, p) => API.get(`/messages/${convId}`, { params: p }),
  sendMessage:  (userId, content) => API.post(`/messages/${userId}`, { content }),
  deleteMessage:(id)     => API.delete(`/messages/${id}`),
  getUnreadCount:()      => API.get('/messages/unread-count'),
}

export const notificationService = {
  getAll:    (p)  => API.get('/notifications', { params: p }),
  getUnread: ()   => API.get('/notifications/unread'),
  markRead:  (id) => API.put(`/notifications/${id}/read`),
  markAllRead:()  => API.put('/notifications/read-all'),
  delete:    (id) => API.delete(`/notifications/${id}`),
  clearAll:  ()   => API.delete('/notifications/clear-all'),
}

export const searchService = {
  global:     (q) => API.get('/search/global', { params: { q } }),
  searchUsers:(q, p) => API.get('/search/users', { params: { q, ...p } }),
  searchJobs: (q, p) => API.get('/search/jobs',  { params: { q, ...p } }),
}

export const uploadService = {
  uploadImage:   (file) => { const fd = new FormData(); fd.append('image', file); return API.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } }) },
  uploadDocument:(file) => { const fd = new FormData(); fd.append('document', file); return API.post('/upload/document', fd, { headers: { 'Content-Type': 'multipart/form-data' } }) },
  deleteFile:    (pid)  => API.delete(`/upload/${pid}`),
}

export const adminService = {
  getStats: () => API.get('/admin/stats'),
}
