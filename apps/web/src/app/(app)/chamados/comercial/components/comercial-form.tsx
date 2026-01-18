'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Save, ArrowLeft, Building2, User, FileText, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { COMERCIAL_TYPES, PERCEIVED_URGENCY } from '../constants'
import type { ComercialCategory } from '../actions'
import type { UserUnit } from '@/lib/units'

interface ComercialFormProps {
  categories: ComercialCategory[]
  units: UserUnit[]
  fixedUnit?: UserUnit | null
  onSubmit: (formData: FormData) => Promise<{ error?: string } | void>
}

// Mascara para CNPJ
function formatCNPJ(value: string): string {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`
  if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`
  if (cleaned.length <= 12) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`
}

// Mascara para telefone
function formatPhone(value: string): string {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
  if (cleaned.length <= 11) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
}

// Mascara para moeda
function formatCurrency(value: string): string {
  const cleaned = value.replace(/\D/g, '')
  if (!cleaned) return ''
  const number = parseInt(cleaned) / 100
  return number.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function parseCurrency(value: string): number {
  const cleaned = value.replace(/\D/g, '')
  return parseInt(cleaned) / 100 || 0
}

export function ComercialForm({ categories, units, fixedUnit, onSubmit }: ComercialFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isUnitFixed = !!fixedUnit
  const hasUnits = units.length > 0
  const showUnitWarning = !hasUnits && !isUnitFixed

  const [formData, setFormData] = useState({
    // Identificacao
    title: '',
    description: '',
    unit_id: fixedUnit?.id || '',
    category_id: '',
    comercial_type: '',
    perceived_urgency: '',
    // Cliente
    client_name: '',
    client_cnpj: '',
    client_phone: '',
    client_email: '',
    // Contrato
    contract_value: '',
    contract_start_date: '',
    contract_end_date: '',
    proposal_deadline: '',
    // Informacoes adicionais
    competitor_info: '',
    negotiation_notes: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleCNPJChange = (value: string) => {
    handleChange('client_cnpj', formatCNPJ(value))
  }

  const handlePhoneChange = (value: string) => {
    handleChange('client_phone', formatPhone(value))
  }

  const handleCurrencyChange = (value: string) => {
    handleChange('contract_value', formatCurrency(value))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validacoes
    if (!formData.title.trim() || formData.title.length < 5) {
      setError('Titulo deve ter pelo menos 5 caracteres')
      return
    }
    if (!formData.description.trim() || formData.description.length < 10) {
      setError('Descricao deve ter pelo menos 10 caracteres')
      return
    }
    if (!formData.unit_id) {
      setError('Selecione a unidade')
      return
    }
    if (!formData.category_id) {
      setError('Selecione a categoria')
      return
    }
    if (!formData.comercial_type) {
      setError('Selecione o tipo comercial')
      return
    }

    const data = new FormData()
    data.set('title', formData.title.trim())
    data.set('description', formData.description.trim())
    data.set('unit_id', formData.unit_id)
    data.set('category_id', formData.category_id)
    data.set('comercial_type', formData.comercial_type)
    data.set('perceived_urgency', formData.perceived_urgency)

    // Cliente
    if (formData.client_name) data.set('client_name', formData.client_name.trim())
    if (formData.client_cnpj) data.set('client_cnpj', formData.client_cnpj)
    if (formData.client_phone) data.set('client_phone', formData.client_phone)
    if (formData.client_email) data.set('client_email', formData.client_email.trim())

    // Contrato
    if (formData.contract_value) {
      data.set('contract_value', parseCurrency(formData.contract_value).toString())
    }
    if (formData.contract_start_date) data.set('contract_start_date', formData.contract_start_date)
    if (formData.contract_end_date) data.set('contract_end_date', formData.contract_end_date)
    if (formData.proposal_deadline) data.set('proposal_deadline', formData.proposal_deadline)

    // Informacoes adicionais
    if (formData.competitor_info) data.set('competitor_info', formData.competitor_info.trim())
    if (formData.negotiation_notes) data.set('negotiation_notes', formData.negotiation_notes.trim())

    startTransition(async () => {
      try {
        const result = await onSubmit(data)
        if (result?.error) {
          setError(result.error)
        }
      } catch (err) {
        setError('Erro ao criar chamado. Tente novamente.')
        console.error('Error submitting form:', err)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/chamados/comercial">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Novo Chamado Comercial</h1>
          <p className="text-muted-foreground">Preencha as informacoes do chamado</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg border border-destructive/20">
          {error}
        </div>
      )}

      {/* Unit Warning */}
      {showUnitWarning && (
        <div className="bg-amber-50 text-amber-800 px-4 py-3 rounded-lg border border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800">
          <strong>Atencao:</strong> Voce nao possui unidades atribuidas. Entre em contato com o administrador.
        </div>
      )}

      {/* Identificacao */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Identificacao
          </CardTitle>
          <CardDescription>Informacoes basicas do chamado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Titulo *</Label>
              <Input
                id="title"
                placeholder="Ex: Proposta para novo contrato"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comercial_type">Tipo Comercial *</Label>
              <Select
                value={formData.comercial_type}
                onValueChange={(value) => handleChange('comercial_type', value)}
                disabled={isPending}
              >
                <SelectTrigger id="comercial_type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {COMERCIAL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="unit_id">Unidade *</Label>
              {isUnitFixed ? (
                <Input
                  id="unit_id"
                  value={`${fixedUnit?.code} - ${fixedUnit?.name}`}
                  disabled
                  className="bg-muted"
                />
              ) : (
                <Select
                  value={formData.unit_id}
                  onValueChange={(value) => handleChange('unit_id', value)}
                  disabled={isPending || !hasUnits}
                >
                  <SelectTrigger id="unit_id">
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.code} - {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_id">Categoria *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleChange('category_id', value)}
                disabled={isPending}
              >
                <SelectTrigger id="category_id">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="perceived_urgency">Urgencia Percebida</Label>
            <Select
              value={formData.perceived_urgency}
              onValueChange={(value) => handleChange('perceived_urgency', value)}
              disabled={isPending}
            >
              <SelectTrigger id="perceived_urgency">
                <SelectValue placeholder="Selecione a urgencia" />
              </SelectTrigger>
              <SelectContent>
                {PERCEIVED_URGENCY.map((urgency) => (
                  <SelectItem key={urgency.value} value={urgency.value}>
                    {urgency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descricao *</Label>
            <Textarea
              id="description"
              placeholder="Descreva detalhadamente a solicitacao..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={isPending}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Dados do Cliente
          </CardTitle>
          <CardDescription>Informacoes do cliente relacionado ao chamado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client_name">Nome / Razao Social</Label>
              <Input
                id="client_name"
                placeholder="Ex: Empresa ABC Ltda"
                value={formData.client_name}
                onChange={(e) => handleChange('client_name', e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_cnpj">CNPJ</Label>
              <Input
                id="client_cnpj"
                placeholder="00.000.000/0000-00"
                value={formData.client_cnpj}
                onChange={(e) => handleCNPJChange(e.target.value)}
                disabled={isPending}
                maxLength={18}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client_phone">Telefone</Label>
              <Input
                id="client_phone"
                placeholder="(00) 00000-0000"
                value={formData.client_phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                disabled={isPending}
                maxLength={15}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_email">Email</Label>
              <Input
                id="client_email"
                type="email"
                placeholder="contato@empresa.com"
                value={formData.client_email}
                onChange={(e) => handleChange('client_email', e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contrato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Dados do Contrato
          </CardTitle>
          <CardDescription>Informacoes financeiras e prazos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contract_value">Valor do Contrato</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                <Input
                  id="contract_value"
                  placeholder="0,00"
                  value={formData.contract_value}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  disabled={isPending}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="proposal_deadline">Prazo da Proposta</Label>
              <Input
                id="proposal_deadline"
                type="date"
                value={formData.proposal_deadline}
                onChange={(e) => handleChange('proposal_deadline', e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contract_start_date">Inicio do Contrato</Label>
              <Input
                id="contract_start_date"
                type="date"
                value={formData.contract_start_date}
                onChange={(e) => handleChange('contract_start_date', e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract_end_date">Fim do Contrato</Label>
              <Input
                id="contract_end_date"
                type="date"
                value={formData.contract_end_date}
                onChange={(e) => handleChange('contract_end_date', e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informacoes Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informacoes Adicionais
          </CardTitle>
          <CardDescription>Informacoes complementares sobre a negociacao</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="competitor_info">Informacoes do Concorrente</Label>
            <Textarea
              id="competitor_info"
              placeholder="Informacoes sobre concorrentes envolvidos na negociacao..."
              value={formData.competitor_info}
              onChange={(e) => handleChange('competitor_info', e.target.value)}
              disabled={isPending}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="negotiation_notes">Notas da Negociacao</Label>
            <Textarea
              id="negotiation_notes"
              placeholder="Observacoes sobre a negociacao..."
              value={formData.negotiation_notes}
              onChange={(e) => handleChange('negotiation_notes', e.target.value)}
              disabled={isPending}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button variant="outline" asChild disabled={isPending}>
          <Link href="/chamados/comercial">Cancelar</Link>
        </Button>
        <Button type="submit" disabled={isPending || showUnitWarning}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Criar Chamado
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
