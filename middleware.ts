import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/request'

export function middleware(request: NextRequest) {
  // يضمن هذا السطر استمرار عمل الموقع حتى لو حدثت أي مشكلة في المتغيرات
  try {
    const response = NextResponse.next()
    return response
  } catch (error) {
    console.error("Middleware error bypassed:", error)
    return NextResponse.next()
  }
}

// تحديد المسارات التي يراقبها الـ Middleware
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
