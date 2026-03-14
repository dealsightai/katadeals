import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    plans: [
      {
        name: 'Starter',
        price: 49,
        features: ['10 deal analyses monthly']
      },
      {
        name: 'Pro',
        price: 99,
        features: ['Unlimited deals', 'ARV + rehab estimates']
      },
      {
        name: 'Investor',
        price: 199,
        features: ['Unlimited deals', 'Commercial analysis', 'Priority support']
      }
    ]
  })
}
