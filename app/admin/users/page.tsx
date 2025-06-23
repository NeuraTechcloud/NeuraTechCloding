"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Users, Plus, Edit, Trash2, Eye, EyeOff, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Modal from "@/components/modal"

interface User {
  id: number
  name: string
  email: string
  user_type: "client" | "admin"
  created_at: string
  vehicle_count?: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    user_type: "client" as "client" | "admin",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Verificar se é admin
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (user.user_type !== "admin" && user.email !== "admin@rastreramos.com") {
      router.push("/")
      return
    }
    loadUsers()
  }, [router])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/users")
      const data = await response.json()
      if (response.ok) {
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = "Nome é obrigatório"
    }

    if (!formData.email.trim()) {
      errors.email = "Email é obrigatório"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email inválido"
    }

    if (!editingUser) {
      // Validações apenas para criação
      if (!formData.password) {
        errors.password = "Senha é obrigatória"
      } else if (formData.password.length < 6) {
        errors.password = "Senha deve ter pelo menos 6 caracteres"
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Senhas não coincidem"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : "/api/admin/users"
      const method = editingUser ? "PUT" : "POST"

      const payload = editingUser
        ? {
            name: formData.name,
            email: formData.email,
            user_type: formData.user_type,
          }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            user_type: formData.user_type,
          }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        alert(editingUser ? "Usuário atualizado com sucesso!" : "Usuário criado com sucesso!")
        resetForm()
        loadUsers()
      } else {
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      alert("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      confirmPassword: "",
      user_type: user.user_type,
    })
    setShowCreateModal(true)
  }

  const handleDelete = async (userId: number) => {
    if (!confirm("Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.")) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        alert("Usuário deletado com sucesso!")
        loadUsers()
      } else {
        const data = await response.json()
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      alert("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      user_type: "client",
    })
    setFormErrors({})
    setEditingUser(null)
    setShowCreateModal(false)
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-amber-500">Gerenciar Usuários</h1>
          <p className="text-gray-400">Criar, editar e gerenciar usuários do sistema</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={() => router.push("/admin")} variant="outline" className="text-gray-300 border-gray-600">
            Voltar ao Admin
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar usuários por nome ou email..."
          className="max-w-md bg-gray-800 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
        />
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>{user.name}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    user.user_type === "admin" ? "bg-red-900 text-red-300" : "bg-green-900 text-green-300"
                  }`}
                >
                  {user.user_type}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Email:</p>
                  <p className="text-white text-sm">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Veículos:</p>
                  <p className="text-white text-sm">{user.vehicle_count || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Cadastro:</p>
                  <p className="text-white text-sm">{new Date(user.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button
                    onClick={() => handleEdit(user)}
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(user.id)}
                    size="sm"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Deletar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Nenhum usuário encontrado</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <Modal onClose={resetForm}>
            <div className="w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-amber-500">
                  {editingUser ? "Editar Usuário" : "Criar Novo Usuário"}
                </h2>
                <Button onClick={resetForm} variant="ghost" className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nome Completo</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Nome do usuário"
                  />
                  {formErrors.name && <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="email@exemplo.com"
                  />
                  {formErrors.email && <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Usuário</label>
                  <select
                    value={formData.user_type}
                    onChange={(e) => setFormData({ ...formData, user_type: e.target.value as "client" | "admin" })}
                    className="w-full bg-gray-700 border border-gray-600 text-white focus:ring-amber-500 focus:border-amber-500 text-sm rounded-md p-2"
                  >
                    <option value="client">Cliente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                {!editingUser && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500 pr-10"
                          placeholder="Senha (mín. 6 caracteres)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {formErrors.password && <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar Senha</label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="bg-gray-700 border-gray-600 focus:ring-amber-500 focus:border-amber-500 pr-10"
                          placeholder="Confirme a senha"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {formErrors.confirmPassword && (
                        <p className="text-red-400 text-sm mt-1">{formErrors.confirmPassword}</p>
                      )}
                    </div>
                  </>
                )}

                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    onClick={resetForm}
                    variant="outline"
                    className="flex-1 text-gray-300 border-gray-600 hover:bg-gray-700"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Salvando..." : editingUser ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </div>
          </Modal>
        </div>
      )}
    </div>
  )
}
