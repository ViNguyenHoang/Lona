import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Button,
  Card,
  Center,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { useForm, isEmail, isNotEmpty } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconLock } from '@tabler/icons-react'
import { useAuth } from '../contexts/AuthContext'
import type { LoginFormValues } from '../types/auth'

interface LocationState {
  from?: { pathname: string }
}

export default function AdminLoginPage() {
  const { user, loading, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitting, setSubmitting] = useState(false)

  const redirectTo =
    (location.state as LocationState | null)?.from?.pathname ??
    '/admin/products'

  useEffect(() => {
    if (!loading && user) {
      navigate(redirectTo, { replace: true })
    }
  }, [loading, user, navigate, redirectTo])

  const form = useForm<LoginFormValues>({
    initialValues: { email: '', password: '' },
    validate: {
      email: isEmail('Email không hợp lệ'),
      password: isNotEmpty('Vui lòng nhập mật khẩu'),
    },
  })

  async function handleSubmit(values: LoginFormValues) {
    setSubmitting(true)
    try {
      await signIn(values.email, values.password)
      navigate(redirectTo, { replace: true })
    } catch {
      notifications.show({
        message: 'Email hoặc mật khẩu không đúng',
        color: 'red',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Center h="100vh" px="md" bg="var(--bg, #f6f7f9)">
      <Card
        shadow="sm"
        padding="lg"
        radius="lg"
        withBorder
        w="100%"
        maw={380}
      >
        <Stack gap="lg">
          <Stack gap={4} align="center">
            <IconLock size={32} color="var(--em-600)" />
            <Text fw={800} fz="lg" ff="var(--font)">
              Đăng nhập admin
            </Text>
            <Text c="dimmed" fz="sm" ff="var(--font)">
              Shop Tạp Hóa Lona
            </Text>
          </Stack>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="sm">
              <TextInput
                label="Email"
                placeholder="vinh@example.com"
                type="email"
                autoComplete="email"
                required
                styles={{
                  label: { fontFamily: 'var(--font)', fontWeight: 600 },
                  input: { fontFamily: 'var(--font)' },
                }}
                {...form.getInputProps('email')}
              />
              <PasswordInput
                label="Mật khẩu"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                styles={{
                  label: { fontFamily: 'var(--font)', fontWeight: 600 },
                  input: { fontFamily: 'var(--font)' },
                }}
                {...form.getInputProps('password')}
              />
              <Button
                type="submit"
                loading={submitting}
                mt="sm"
                color="var(--em-600)"
                styles={{
                  root: { fontFamily: 'var(--font)', fontWeight: 800 },
                }}
              >
                Đăng nhập
              </Button>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Center>
  )
}
