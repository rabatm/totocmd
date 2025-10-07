'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ChronopostTracker from '@/components/shipments/ChronopostTracker'

export default function TestChronopostPage() {
  const [trackingNumber, setTrackingNumber] = useState('1234567890ABCD')
  const [activeTracking, setActiveTracking] = useState('1234567890ABCD')

  const testNumbers = [
    '1234567890ABCD',
    'ABCD1234567890',
    'EFGH0987654321',
    'WXYZ1111222233'
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Chronopost Tracker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <Label htmlFor="tracking">Numéro de suivi</Label>
                <Input
                  id="tracking"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Entrez un numéro de suivi"
                />
              </div>
              <Button onClick={() => setActiveTracking(trackingNumber)}>
                Tester
              </Button>
            </div>

            <div className="flex space-x-2">
              {testNumbers.map((number) => (
                <Button
                  key={number}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTrackingNumber(number)
                    setActiveTracking(number)
                  }}
                >
                  {number}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vue complète */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Vue complète</h2>
          <ChronopostTracker trackingNumber={activeTracking} />
        </div>

        {/* Vue compacte */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Vue compacte</h2>
          <ChronopostTracker trackingNumber={activeTracking} compact />
        </div>

        {/* Plusieurs trackers compacts */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Plusieurs colis</h2>
          <div className="space-y-3">
            {testNumbers.slice(0, 3).map((number) => (
              <ChronopostTracker
                key={number}
                trackingNumber={number}
                compact
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}