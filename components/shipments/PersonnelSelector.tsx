'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, User, Users, RotateCcw } from 'lucide-react'
import { useActivePersonnel } from '@/hooks/usePersonnel'
import { Personnel } from '@/src/types'
import { cn } from '@/lib/utils'

interface PersonnelSelectorProps {
  onSelectionChange: (selection: {
    preparateur?: Personnel
    verificateur?: Personnel
    preparateurId?: string
    verificateurId?: string
  }) => void
  initialPreparateur?: Personnel
  initialVerificateur?: Personnel
  className?: string
}

export default function PersonnelSelector({
  onSelectionChange,
  initialPreparateur,
  initialVerificateur,
  className
}: PersonnelSelectorProps) {
  const { data: personnelData, isLoading, error } = useActivePersonnel()
  const personnel = personnelData?.data || []

  // État local pour la sélection
  const [preparateur, setPreparateur] = useState<Personnel | undefined>(initialPreparateur)
  const [verificateur, setVerificateur] = useState<Personnel | undefined>(initialVerificateur)

  // Logique de sélection avec double-clic
  const handlePersonnelClick = (person: Personnel) => {
    let newPreparateur: Personnel | undefined = preparateur
    let newVerificateur: Personnel | undefined = verificateur

    if (!preparateur) {
      // Premier clic - Assigner comme préparateur
      newPreparateur = person
    } else if (preparateur.id === person.id && !verificateur) {
      // Deuxième clic sur le même - Assigner comme vérificateur ET libérer préparateur
      newVerificateur = person
      newPreparateur = undefined
    } else if (!verificateur) {
      // Clic sur quelqu'un d'autre - Assigner comme vérificateur
      newVerificateur = person
    } else {
      // Reset complet - Nouveau préparateur
      newPreparateur = person
      newVerificateur = undefined
    }

    setPreparateur(newPreparateur)
    setVerificateur(newVerificateur)

    // Notifier le parent
    onSelectionChange({
      preparateur: newPreparateur,
      verificateur: newVerificateur,
      preparateurId: newPreparateur?.id.toString(),
      verificateurId: newVerificateur?.id.toString()
    })
  }

  // Reset de la sélection
  const handleReset = () => {
    setPreparateur(undefined)
    setVerificateur(undefined)
    onSelectionChange({})
  }

  // Obtenir les initiales pour l'avatar
  const getInitials = (person: Personnel) => {
    return `${person.prenom?.[0] || ''}${person.nom?.[0] || ''}`.toUpperCase()
  }

  // Vérifier si une personne est sélectionnée
  const isSelected = (person: Personnel) => {
    return preparateur?.id === person.id || verificateur?.id === person.id
  }

  // Obtenir le rôle d'une personne
  const getRole = (person: Personnel) => {
    if (preparateur?.id === person.id) return 'preparateur'
    if (verificateur?.id === person.id) return 'verificateur'
    return null
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Chargement du personnel...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <User className="h-8 w-8 mx-auto mb-2" />
            <p>Erreur lors du chargement du personnel</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Sélection du personnel
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!preparateur && !verificateur}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          1er clic = Préparateur • 2ème clic = Vérificateur
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ÉQUIPE DISPONIBLE */}
          <div className="lg:col-span-2">
            <h3 className="font-medium text-sm text-gray-700 mb-3 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Équipe disponible ({personnel.length})
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {personnel.map((person) => {
                const role = getRole(person)
                const selected = isSelected(person)

                return (
                  <div
                    key={person.id}
                    onClick={() => handlePersonnelClick(person)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      "hover:bg-gray-50 hover:border-gray-300",
                      selected && role === 'preparateur' && "bg-blue-50 border-blue-200 ring-1 ring-blue-200",
                      selected && role === 'verificateur' && "bg-purple-50 border-purple-200 ring-1 ring-purple-200"
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={person.avatar} />
                      <AvatarFallback className="text-xs">
                        {getInitials(person)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {person.prenom} {person.nom}
                      </p>
                      {role && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs mt-1",
                            role === 'preparateur' && "bg-blue-100 text-blue-700",
                            role === 'verificateur' && "bg-purple-100 text-purple-700"
                          )}
                        >
                          {role === 'preparateur' ? 'Préparateur' : 'Vérificateur'}
                        </Badge>
                      )}
                    </div>

                    {selected && (
                      <CheckCircle2 className={cn(
                        "h-5 w-5",
                        role === 'preparateur' && "text-blue-600",
                        role === 'verificateur' && "text-purple-600"
                      )} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* AFFECTATIONS */}
          <div>
            <h3 className="font-medium text-sm text-gray-700 mb-3">
              Affectations
            </h3>

            <div className="space-y-4">
              {/* Préparateur */}
              <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                  <span className="font-medium text-sm text-blue-900">Préparateur</span>
                </div>

                {preparateur ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={preparateur.avatar} />
                      <AvatarFallback className="text-xs">
                        {getInitials(preparateur)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-blue-800 font-medium">
                      {preparateur.prenom} {preparateur.nom}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-blue-600">Non assigné</span>
                )}
              </div>

              <Separator />

              {/* Vérificateur */}
              <div className="p-4 rounded-lg border border-purple-200 bg-purple-50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 rounded-full bg-purple-600"></div>
                  <span className="font-medium text-sm text-purple-900">Vérificateur</span>
                </div>

                {verificateur ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={verificateur.avatar} />
                      <AvatarFallback className="text-xs">
                        {getInitials(verificateur)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-purple-800 font-medium">
                      {verificateur.prenom} {verificateur.nom}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-purple-600">Non assigné</span>
                )}
              </div>

              {/* Validation */}
              {preparateur && verificateur && preparateur.id === verificateur.id && (
                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Le vérificateur doit être différent du préparateur
                  </p>
                </div>
              )}

              {preparateur && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm text-green-800">
                    ✅ Prêt pour la création
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}