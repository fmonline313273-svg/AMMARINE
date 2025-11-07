import { NextRequest, NextResponse } from 'next/server'

// In production, store these securely in environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || ''
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Generate a simple token (in production, use JWT)
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64')
      
      return NextResponse.json({ 
        success: true, 
        token,
        message: 'Login successful' 
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
