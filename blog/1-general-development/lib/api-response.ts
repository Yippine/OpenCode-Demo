// API 回應工具
export function successResponse(data: any, message = 'Success') {
  return Response.json({ success: true, message, data }, { status: 200 })
}

export function errorResponse(message: string, status = 400) {
  return Response.json({ success: false, message }, { status })
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return Response.json({ success: false, message }, { status: 401 })
}

export function notFoundResponse(message = 'Not found') {
  return Response.json({ success: false, message }, { status: 404 })
}
