import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  UserOutlined
} from '@ant-design/icons'
import { useTheme } from '@renderer/context/ThemeProvider'
import MemoryService from '@renderer/services/MemoryService'
import {
  selectCurrentUserId,
  selectGlobalMemoryEnabled,
  setCurrentUserId,
  setGlobalMemoryEnabled
} from '@renderer/store/memory'
import type { MemoryItem } from '@types'
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Empty,
  Form,
  Input,
  Modal,
  Pagination,
  Select,
  Space,
  Spin,
  Switch
} from 'antd'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Brain } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import {
  SettingContainer,
  SettingDivider,
  SettingGroup,
  SettingHelpText,
  SettingRow,
  SettingRowTitle,
  SettingTitle
} from '../index'
import MemoriesSettingsModal from './MemoriesSettingsModal'

dayjs.extend(relativeTime)

const DEFAULT_USER_ID = 'default-user'
const { Option } = Select
const { TextArea } = Input

interface AddMemoryModalProps {
  visible: boolean
  onCancel: () => void
  onAdd: (memory: string) => Promise<void>
}

interface EditMemoryModalProps {
  visible: boolean
  memory: MemoryItem | null
  onCancel: () => void
  onUpdate: (id: string, memory: string, metadata?: Record<string, any>) => Promise<void>
}

interface AddUserModalProps {
  visible: boolean
  onCancel: () => void
  onAdd: (userId: string) => void
  existingUsers: string[]
}

const AddMemoryModal: React.FC<AddMemoryModalProps> = ({ visible, onCancel, onAdd }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  const handleSubmit = async (values: { memory: string }) => {
    setLoading(true)
    try {
      await onAdd(values.memory)
      form.resetFields()
      onCancel()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      width={600}
      centered
      transitionName="animation-move-down"
      onOk={() => form.submit()}
      okButtonProps={{ loading: loading }}
      title={
        <Space>
          <PlusOutlined style={{ color: 'var(--color-primary)' }} />
          <span>{t('memory.add_memory')}</span>
        </Space>
      }
      styles={{
        header: {
          borderBottom: '0.5px solid var(--color-border)',
          paddingBottom: 16,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0
        },
        body: {
          paddingTop: 20
        }
      }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label={t('memory.memory_content')}
          name="memory"
          rules={[{ required: true, message: t('memory.please_enter_memory') }]}>
          <TextArea
            rows={5}
            placeholder={t('memory.memory_placeholder')}
            style={{ fontSize: '15px', lineHeight: '1.6' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

const EditMemoryModal: React.FC<EditMemoryModalProps> = ({ visible, memory, onCancel, onUpdate }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    if (memory && visible) {
      form.setFieldsValue({
        memory: memory.memory
      })
    }
  }, [memory, visible, form])

  const handleSubmit = async (values: { memory: string }) => {
    if (!memory) return

    setLoading(true)
    try {
      await onUpdate(memory.id, values.memory)
      form.resetFields()
      onCancel()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={
        <Space>
          <EditOutlined style={{ color: 'var(--color-primary)' }} />
          <span>{t('memory.edit_memory')}</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={600}
      styles={{
        header: {
          borderBottom: '0.5px solid var(--color-border)',
          paddingBottom: 16
        },
        body: {
          paddingTop: 24
        }
      }}
      footer={[
        <Button key="cancel" size="large" onClick={onCancel}>
          {t('common.cancel')}
        </Button>,
        <Button key="submit" type="primary" size="large" loading={loading} onClick={() => form.submit()}>
          {t('common.save')}
        </Button>
      ]}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label={t('memory.memory_content')}
          name="memory"
          rules={[{ required: true, message: t('memory.please_enter_memory') }]}>
          <TextArea
            rows={5}
            placeholder={t('memory.memory_placeholder')}
            style={{ fontSize: '15px', lineHeight: '1.6' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

const AddUserModal: React.FC<AddUserModalProps> = ({ visible, onCancel, onAdd, existingUsers }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  const handleSubmit = async (values: { userId: string }) => {
    setLoading(true)
    try {
      await onAdd(values.userId.trim())
      form.resetFields()
      onCancel()
    } finally {
      setLoading(false)
    }
  }

  const validateUserId = (_: any, value: string) => {
    if (!value || !value.trim()) {
      return Promise.reject(new Error(t('memory.user_id_required')))
    }
    const trimmedValue = value.trim()
    if (trimmedValue === DEFAULT_USER_ID) {
      return Promise.reject(new Error(t('memory.user_id_reserved')))
    }
    if (existingUsers.includes(trimmedValue)) {
      return Promise.reject(new Error(t('memory.user_id_exists')))
    }
    if (trimmedValue.length > 50) {
      return Promise.reject(new Error(t('memory.user_id_too_long')))
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedValue)) {
      return Promise.reject(new Error(t('memory.user_id_invalid_chars')))
    }
    return Promise.resolve()
  }

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      width={500}
      centered
      transitionName="animation-move-down"
      onOk={() => form.submit()}
      okButtonProps={{ loading: loading }}
      styles={{
        header: {
          borderBottom: '0.5px solid var(--color-border)',
          paddingBottom: 16,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0
        },
        body: {
          paddingTop: 24
        }
      }}
      title={
        <Space>
          <UserAddOutlined style={{ color: 'var(--color-primary)' }} />
          <span>{t('memory.add_user')}</span>
        </Space>
      }>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item label={t('memory.new_user_id')} name="userId" rules={[{ validator: validateUserId }]}>
          <Input
            placeholder={t('memory.new_user_id_placeholder')}
            maxLength={50}
            size="large"
            prefix={<UserOutlined />}
          />
        </Form.Item>
        <div
          style={{
            marginBottom: 16,
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            background: 'var(--color-background-soft)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)'
          }}>
          {t('memory.user_id_rules')}
        </div>
      </Form>
    </Modal>
  )
}

const MemorySettings = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUserId)
  const globalMemoryEnabled = useSelector(selectGlobalMemoryEnabled)

  const [allMemories, setAllMemories] = useState<MemoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [debouncedSearchText, setDebouncedSearchText] = useState('')
  const [settingsModalVisible, setSettingsModalVisible] = useState(false)
  const [addMemoryModalVisible, setAddMemoryModalVisible] = useState(false)
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null)
  const [addUserModalVisible, setAddUserModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [uniqueUsers, setUniqueUsers] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const memoryService = MemoryService.getInstance()

  // Utility functions
  const getUserDisplayName = (user: string) => {
    return user === DEFAULT_USER_ID ? t('memory.default_user') : user
  }

  const getUserAvatar = (user: string) => {
    return user === DEFAULT_USER_ID ? user.slice(0, 1).toUpperCase() : user.slice(0, 2).toUpperCase()
  }

  // Load unique users from database
  const loadUniqueUsers = useCallback(async () => {
    try {
      const usersList = await memoryService.getUsersList()
      const users = usersList.map((user) => user.userId)
      setUniqueUsers(users)
    } catch (error) {
      console.error('Failed to load users list:', error)
    }
  }, [memoryService])

  // Load memories function
  const loadMemories = useCallback(
    async (userId?: string) => {
      const targetUser = userId || currentUser
      console.log('Loading all memories for user:', targetUser)
      setLoading(true)
      try {
        // First, ensure the memory service is using the correct user
        memoryService.setCurrentUser(targetUser)

        // Load unique users efficiently from database
        await loadUniqueUsers()

        // Get all memories for current user context (load up to 10000)
        const result = await memoryService.list({ limit: 10000, offset: 0 })
        console.log('Loaded memories for user:', targetUser, 'count:', result.results?.length || 0)
        setAllMemories(result.results || [])
      } catch (error) {
        console.error('Failed to load memories:', error)
        window.message.error(t('memory.load_failed'))
      } finally {
        setLoading(false)
      }
    },
    [currentUser, memoryService, t, loadUniqueUsers]
  )

  // Sync memoryService with Redux store on mount and when currentUser changes
  useEffect(() => {
    console.log('useEffect triggered for currentUser:', currentUser)
    // Reset to first page when user changes
    setCurrentPage(1)
    loadMemories(currentUser)
  }, [currentUser, loadMemories])

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchText])

  // Filter memories based on search criteria with debounced search
  const filteredMemories = useMemo(() => {
    return allMemories.filter((memory) => {
      // Search text filter
      return !(debouncedSearchText && !memory.memory.toLowerCase().includes(debouncedSearchText.toLowerCase()))
    })
  }, [allMemories, debouncedSearchText])

  // Calculate paginated memories
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedMemories = filteredMemories.slice(startIndex, endIndex)

  const handleSearch = (value: string) => {
    setSearchText(value)
    // Reset to first page when searching
    setCurrentPage(1)
  }

  // Reset to first page when debounced search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchText])

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page)
    if (size && size !== pageSize) {
      setPageSize(size)
    }
  }

  const handleAddMemory = async (memory: string) => {
    try {
      // The memory service will automatically use the current user from its state
      await memoryService.add(memory, {})
      window.message.success(t('memory.add_success'))
      // Go to first page to see the newly added memory
      setCurrentPage(1)
      await loadMemories(currentUser)
    } catch (error) {
      console.error('Failed to add memory:', error)
      window.message.error(t('memory.add_failed'))
    }
  }

  const handleDeleteMemory = async (id: string) => {
    try {
      await memoryService.delete(id)
      window.message.success(t('memory.delete_success'))
      // Reload all memories
      await loadMemories(currentUser)
    } catch (error) {
      console.error('Failed to delete memory:', error)
      window.message.error(t('memory.delete_failed'))
    }
  }

  const handleEditMemory = (memory: MemoryItem) => {
    setEditingMemory(memory)
  }

  const handleUpdateMemory = async (id: string, memory: string, metadata?: Record<string, any>) => {
    try {
      await memoryService.update(id, memory, metadata)
      window.message.success(t('memory.update_success'))
      setEditingMemory(null)
      // Reload all memories
      await loadMemories(currentUser)
    } catch (error) {
      console.error('Failed to update memory:', error)
      window.message.error(t('memory.update_failed'))
    }
  }

  const handleUserSwitch = async (userId: string) => {
    console.log('Switching to user:', userId)

    // First update Redux state
    dispatch(setCurrentUserId(userId))

    // Clear current memories to show loading state immediately
    setAllMemories([])

    // Reset pagination
    setCurrentPage(1)

    try {
      // Explicitly load memories for the new user
      await loadMemories(userId)

      window.message.success(
        t('memory.user_switched', { user: userId === DEFAULT_USER_ID ? t('memory.default_user') : userId })
      )
    } catch (error) {
      console.error('Failed to switch user:', error)
      window.message.error(t('memory.user_switch_failed'))
    }
  }

  const handleAddUser = async (userId: string) => {
    try {
      // Create the user by adding an initial memory with the userId
      // This implicitly creates the user in the system
      await memoryService.setCurrentUser(userId)
      await memoryService.add(t('memory.initial_memory_content'), { userId })

      // Refresh the users list from the database to persist the new user
      await loadUniqueUsers()

      // Switch to the newly created user
      await handleUserSwitch(userId)
      window.message.success(t('memory.user_created', { user: userId }))
      setAddUserModalVisible(false)
    } catch (error) {
      console.error('Failed to add user:', error)
      window.message.error(t('memory.add_user_failed'))
    }
  }

  const handleSettingsSubmit = async () => {
    setSettingsModalVisible(false)
    await memoryService.updateConfig()
  }

  const handleSettingsCancel = () => {
    setSettingsModalVisible(false)
    form.resetFields()
  }

  const handleResetMemories = async (userId: string) => {
    window.modal.confirm({
      centered: true,
      title: t('memory.reset_memories_confirm_title'),
      content: t('memory.reset_memories_confirm_content', { user: getUserDisplayName(userId) }),
      icon: <ExclamationCircleOutlined />,
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      okType: 'danger',
      onOk: async () => {
        try {
          await memoryService.deleteAllMemoriesForUser(userId)
          window.message.success(t('memory.memories_reset_success', { user: getUserDisplayName(userId) }))

          // Reload memories to show the empty state
          await loadMemories(currentUser)
        } catch (error) {
          console.error('Failed to reset memories:', error)
          window.message.error(t('memory.reset_memories_failed'))
        }
      }
    })
  }

  const handleDeleteUser = async (userId: string) => {
    if (userId === DEFAULT_USER_ID) {
      window.message.error(t('memory.cannot_delete_default_user'))
      return
    }

    window.modal.confirm({
      centered: true,
      title: t('memory.delete_user_confirm_title'),
      content: t('memory.delete_user_confirm_content', { user: userId }),
      icon: <ExclamationCircleOutlined />,
      okText: t('common.yes'),
      cancelText: t('common.no'),
      okType: 'danger',
      onOk: async () => {
        try {
          await memoryService.deleteUser(userId)
          window.message.success(t('memory.user_deleted', { user: userId }))

          // Refresh the users list from database after deletion
          await loadUniqueUsers()

          // Switch to default user if current user was deleted
          if (currentUser === userId) {
            await handleUserSwitch(DEFAULT_USER_ID)
          } else {
            await loadMemories(currentUser)
          }
        } catch (error) {
          console.error('Failed to delete user:', error)
          window.message.error(t('memory.delete_user_failed'))
        }
      }
    })
  }

  const handleGlobalMemoryToggle = (enabled: boolean) => {
    dispatch(setGlobalMemoryEnabled(enabled))
    window.message.success(enabled ? t('memory.global_memory_enabled') : t('memory.global_memory_disabled_title'))
  }

  const { theme } = useTheme()

  return (
    <SettingContainer theme={theme}>
      {/* Memory Settings */}
      <SettingGroup theme={theme}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '2px' }}>
          <SettingTitle>{t('memory.settings')}</SettingTitle>
          <span
            style={{
              fontSize: '12px',
              color: 'var(--color-primary)',
              background: 'var(--color-primary-bg)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: '500'
            }}>
            Beta
          </span>
        </div>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>{t('memory.global_memory')}</SettingRowTitle>
          <Switch checked={globalMemoryEnabled} onChange={handleGlobalMemoryToggle} />
        </SettingRow>
        <SettingDivider />
        <SettingRow>
          <SettingRowTitle>{t('memory.settings')}</SettingRowTitle>
          <Button icon={<SettingOutlined />} onClick={() => setSettingsModalVisible(true)}>
            {t('common.settings')}
          </Button>
        </SettingRow>
      </SettingGroup>

      {/* User Management */}
      <SettingGroup theme={theme}>
        <SettingTitle>{t('memory.user_management')}</SettingTitle>
        <SettingDivider />
        <SettingRow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <SettingRowTitle>{t('memory.user_id')}</SettingRowTitle>
            <SettingHelpText style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--color-text-secondary)' }}>
              {allMemories.length} {t('memory.total_memories')}
            </SettingHelpText>
          </div>
          <Select
            value={currentUser}
            onChange={handleUserSwitch}
            style={{ width: 200 }}
            dropdownRender={(menu) => (
              <>
                {menu}
                <div style={{ padding: '8px' }}>
                  <Button
                    type="text"
                    onClick={() => setAddUserModalVisible(true)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start'
                    }}>
                    <Space align="center">
                      <UserAddOutlined />
                      <span>{t('memory.add_new_user')}</span>
                    </Space>
                  </Button>
                </div>
              </>
            )}>
            <Option value={DEFAULT_USER_ID}>
              <Space align="center">
                <Avatar size={20} style={{ background: 'var(--color-primary)' }}>
                  {getUserAvatar(DEFAULT_USER_ID)}
                </Avatar>
                <span>{t('memory.default_user')}</span>
              </Space>
            </Option>
            {uniqueUsers
              .filter((user) => user !== DEFAULT_USER_ID)
              .map((user) => (
                <Option key={user} value={user}>
                  <Space align="center">
                    <Avatar size={20} style={{ background: 'var(--color-primary)' }}>
                      {getUserAvatar(user)}
                    </Avatar>
                    <span>{user}</span>
                  </Space>
                </Option>
              ))}
          </Select>
        </SettingRow>
        <SettingDivider />
        <SettingRow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <SettingRowTitle>{t('memory.users')}</SettingRowTitle>
            <SettingHelpText style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--color-text-secondary)' }}>
              {t('memory.statistics')}
            </SettingHelpText>
          </div>
          <Badge count={uniqueUsers.length} showZero style={{ backgroundColor: 'var(--color-primary)' }} />
        </SettingRow>
      </SettingGroup>

      {/* Memory List */}
      <SettingGroup theme={theme}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <SettingTitle>{t('memory.title')}</SettingTitle>
          <Space>
            <Input.Search
              placeholder={t('memory.search_placeholder')}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              style={{ width: 240 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddMemoryModalVisible(true)}>
              {t('memory.add_memory')}
            </Button>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'refresh',
                    label: t('common.refresh'),
                    icon: <ReloadOutlined />,
                    onClick: () => loadMemories(currentUser)
                  },
                  {
                    key: 'divider-reset',
                    type: 'divider' as const
                  },
                  {
                    key: 'reset',
                    label: t('memory.reset_memories'),
                    icon: <DeleteOutlined />,
                    danger: true,
                    onClick: () => handleResetMemories(currentUser)
                  },
                  ...(currentUser !== DEFAULT_USER_ID
                    ? [
                        {
                          key: 'divider-1',
                          type: 'divider' as const
                        },
                        {
                          key: 'deleteUser',
                          label: t('memory.delete_user'),
                          icon: <UserDeleteOutlined />,
                          danger: true,
                          onClick: () => handleDeleteUser(currentUser)
                        }
                      ]
                    : [])
                ]
              }}
              trigger={['click']}
              placement="bottomRight">
              <Button icon={<MoreOutlined />}>{t('common.more')}</Button>
            </Dropdown>
          </Space>
        </div>
        <SettingDivider />

        {/* Memory Content Area */}
        <div style={{ minHeight: 400 }}>
          {allMemories.length === 0 && !loading ? (
            <Empty
              image={<Brain size={48} style={{ opacity: 0.3 }} />}
              description={
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{t('memory.no_memories')}</div>
                  <div style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>
                    {t('memory.no_memories_description')}
                  </div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setAddMemoryModalVisible(true)}
                    size="large">
                    {t('memory.add_first_memory')}
                  </Button>
                </div>
              }
            />
          ) : (
            <>
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                  <Spin size="large" />
                </div>
              )}

              {!loading && filteredMemories.length === 0 && allMemories.length > 0 && (
                <Empty description={t('memory.no_matching_memories')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}

              {!loading && filteredMemories.length > 0 && (
                <>
                  <MemoryListContainer>
                    {paginatedMemories.map((memory) => (
                      <MemoryItem key={memory.id}>
                        <div className="memory-header">
                          <div className="memory-meta">
                            <CalendarOutlined style={{ marginRight: 4 }} />
                            <span>{memory.createdAt ? dayjs(memory.createdAt).fromNow() : '-'}</span>
                          </div>
                          <Space size="small">
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => handleEditMemory(memory)}
                            />
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => {
                                window.modal.confirm({
                                  centered: true,
                                  title: t('memory.delete_confirm'),
                                  content: t('memory.delete_confirm_single'),
                                  onOk: () => handleDeleteMemory(memory.id),
                                  okText: t('common.confirm'),
                                  cancelText: t('common.cancel')
                                })
                              }}
                            />
                          </Space>
                        </div>
                        <div className="memory-content">{memory.memory}</div>
                      </MemoryItem>
                    ))}
                  </MemoryListContainer>

                  <div style={{ marginTop: 16, textAlign: 'center' }}>
                    <Pagination
                      current={currentPage}
                      pageSize={pageSize}
                      total={filteredMemories.length}
                      onChange={handlePageChange}
                      showSizeChanger
                      showTotal={(total, range) =>
                        t('memory.pagination_total', { start: range[0], end: range[1], total })
                      }
                      pageSizeOptions={['20', '50', '100', '200']}
                      defaultPageSize={50}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </SettingGroup>

      {/* Modals */}
      <AddMemoryModal
        visible={addMemoryModalVisible}
        onCancel={() => setAddMemoryModalVisible(false)}
        onAdd={handleAddMemory}
      />

      <EditMemoryModal
        visible={!!editingMemory}
        memory={editingMemory}
        onCancel={() => setEditingMemory(null)}
        onUpdate={handleUpdateMemory}
      />

      <AddUserModal
        visible={addUserModalVisible}
        onCancel={() => setAddUserModalVisible(false)}
        onAdd={handleAddUser}
        existingUsers={[...uniqueUsers, DEFAULT_USER_ID]}
      />

      <MemoriesSettingsModal
        visible={settingsModalVisible}
        onSubmit={async () => await handleSettingsSubmit()}
        onCancel={handleSettingsCancel}
        form={form}
      />
    </SettingContainer>
  )
}

// Styled Components
const MemoryListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 500px;
  overflow-y: auto;
`

const MemoryItem = styled.div`
  padding: 12px;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--list-item-border-radius);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-primary);
    background: var(--color-background);
  }

  .memory-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .memory-meta {
    display: flex;
    align-items: center;
    color: var(--color-text-tertiary);
    font-size: 12px;
  }

  .memory-content {
    color: var(--color-text);
    font-size: 14px;
    line-height: 1.6;
    word-break: break-word;
  }
`

export default MemorySettings
