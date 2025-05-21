import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { questionsService } from "../../api/questions"
import Sidebar from "../../components/common/Sidebar"
import { authService } from "../../api/auth"
import "./QuestionsPage.css"

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)

  // Состояние для модального окна добавления/редактирования вопроса
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(null)

  // Состояние для загрузки вариантов ответов
  const [loadingOptions, setLoadingOptions] = useState(false)

  // Состояние для формы вопроса
  const [formData, setFormData] = useState({
    text: "",
    type: "TEXT", // По умолчанию текстовый тип
    required: false,
    category: "",
    orderNumber: 0,
    options: [],
  })

  const navigate = useNavigate()

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      navigate("/login")
      return
    }
    setCurrentUser(user)

    fetchQuestions()
  }, [navigate])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const data = await questionsService.getAllQuestions()
      // Проверяем, что data является массивом, иначе используем пустой массив
      setQuestions(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      setError(
        "Ошибка при загрузке вопросов: " +
          (err.response?.data?.message || err.message)
      )
      console.error("Failed to fetch questions:", err)
      setQuestions([]) // Устанавливаем пустой массив в случае ошибки
    } finally {
      setLoading(false)
    }
  }

  // Загрузка вариантов ответов для вопроса
  const fetchOptionsForQuestion = async questionId => {
    if (!questionId) return []

    try {
      setLoadingOptions(true)
      const options = await questionsService.getQuestionOptions(questionId)
      return Array.isArray(options) ? options : []
    } catch (err) {
      console.error(`Error fetching options for question ${questionId}:`, err)
      return []
    } finally {
      setLoadingOptions(false)
    }
  }

  const openAddModal = () => {
    setCurrentQuestion(null)
    setFormData({
      text: "",
      type: "TEXT",
      required: false,
      category: "",
      orderNumber: questions.length + 1,
      options: [],
    })
    setIsModalOpen(true)
  }

  const openEditModal = async question => {
    setCurrentQuestion(question)
    setLoadingOptions(true)

    // Загружаем варианты ответов с сервера для вопросов с выбором
    let options = []
    if (
      question.type === "SINGLE_CHOICE" ||
      question.type === "MULTIPLE_CHOICE"
    ) {
      options = await fetchOptionsForQuestion(question.id)
    }

    setFormData({
      text: question.text,
      type: question.type,
      required: question.required,
      category: question.category || "",
      orderNumber: question.orderNumber || 0,
      options: options.length > 0 ? options : question.options || [],
    })

    setLoadingOptions(false)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setCurrentQuestion(null)
  }

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target

    // Если меняется тип вопроса и новый тип не поддерживает варианты ответов,
    // очищаем массив вариантов
    if (
      name === "type" &&
      value !== "SINGLE_CHOICE" &&
      value !== "MULTIPLE_CHOICE"
    ) {
      setFormData({
        ...formData,
        [name]: value,
        options: [],
      })
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      })
    }
  }

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: "" }],
    })
  }

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...formData.options]

    // Сохраняем id варианта ответа, если он уже существует
    const optionId = updatedOptions[index]?.id
    updatedOptions[index] = {
      ...(optionId ? { id: optionId } : {}),
      text: value,
      orderNumber: index + 1,
    }

    setFormData({
      ...formData,
      options: updatedOptions,
    })
  }

  const handleRemoveOption = async index => {
    const options = [...formData.options]
    const optionToRemove = options[index]

    // Если у варианта ответа есть id, значит он уже существует в базе
    // и нужно удалить его через API
    if (optionToRemove?.id && currentQuestion?.id) {
      try {
        await questionsService.deleteOption(optionToRemove.id)
      } catch (err) {
        console.error(`Error deleting option ${optionToRemove.id}:`, err)
      }
    }

    const updatedOptions = options.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      options: updatedOptions,
    })
  }

  const handleSubmit = async e => {
    e.preventDefault()

    try {
      let savedQuestion
      const questionData = { ...formData }

      // Не отправляем варианты ответов вместе с вопросом
      delete questionData.options

      if (currentQuestion) {
        // Обновление существующего вопроса
        savedQuestion = await questionsService.updateQuestion(
          currentQuestion.id,
          questionData
        )
      } else {
        // Создание нового вопроса
        savedQuestion = await questionsService.createQuestion(questionData)
      }

      // Если это вопрос с вариантами, сохраняем варианты ответов
      if (
        (formData.type === "SINGLE_CHOICE" ||
          formData.type === "MULTIPLE_CHOICE") &&
        savedQuestion &&
        savedQuestion.id
      ) {
        // Сохраняем каждый вариант ответа
        for (const option of formData.options) {
          try {
            const optionData = {
              text: option.text,
              orderNumber: option.orderNumber || 0,
            }

            if (option.id) {
              // Обновляем существующий вариант
              await questionsService.updateOption(option.id, optionData)
            } else {
              // Создаем новый вариант
              await questionsService.createOption(savedQuestion.id, optionData)
            }
          } catch (err) {
            console.error("Error saving option:", err)
          }
        }
      }

      closeModal()
      fetchQuestions() // Обновляем список после изменений
    } catch (err) {
      setError(
        "Ошибка при сохранении вопроса: " +
          (err.response?.data?.message || err.message)
      )
      console.error("Failed to save question:", err)
    }
  }

  const handleDeleteQuestion = async id => {
    if (window.confirm("Вы уверены, что хотите удалить этот вопрос?")) {
      try {
        await questionsService.deleteQuestion(id)
        fetchQuestions() // Обновляем список после удаления
      } catch (err) {
        setError(
          "Ошибка при удалении вопроса: " +
            (err.response?.data?.message || err.message)
        )
        console.error("Failed to delete question:", err)
      }
    }
  }

  // Функция для отображения типа вопроса в читаемом формате
  const getQuestionTypeLabel = type => {
    const types = {
      TEXT: "Текстовый",
      MULTIPLE_CHOICE: "Множественный выбор",
      SINGLE_CHOICE: "Одиночный выбор",
      RATING: "Рейтинг",
      DATE: "Дата",
    }
    return types[type] || type
  }

  return (
    <div className="dashboard-container">
      <Sidebar user={currentUser} />
      <div className="dashboard-content">
        <div className="questions-header">
          <h1>База вопросов</h1>
          <button className="btn-add-question" onClick={openAddModal}>
            Добавить вопрос
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-spinner">Загрузка...</div>
        ) : (
          <div className="questions-list">
            <table>
              <thead>
                <tr>
                  <th>№</th>
                  <th>Текст вопроса</th>
                  <th>Тип</th>
                  <th>Категория</th>
                  <th>Обязательный</th>
                  {/* <th>Кол-во вариантов</th> */}
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {!Array.isArray(questions) || questions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      Вопросы не найдены
                    </td>
                  </tr>
                ) : (
                  questions.map((question, index) => (
                    <tr key={question.id || index}>
                      <td>{question.orderNumber || index + 1}</td>
                      <td>{question.text}</td>
                      <td>{getQuestionTypeLabel(question.type)}</td>
                      <td>{question.category || "Без категории"}</td>
                      <td>{question.required ? "Да" : "Нет"}</td>
                      {/* <td>
                        {question.type === "SINGLE_CHOICE" ||
                        question.type === "MULTIPLE_CHOICE"
                          ? question.options?.length || 0
                          : "-"}
                      </td> */}
                      <td className="actions">
                        <button
                          className="btn-edit"
                          onClick={() => openEditModal(question)}
                        >
                          Редактировать
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Модальное окно для добавления/редактирования вопроса */}
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={closeModal}>
                &times;
              </span>
              <h2>
                {currentQuestion
                  ? "Редактирование вопроса"
                  : "Добавление вопроса"}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="text">Текст вопроса*:</label>
                  <textarea
                    id="text"
                    name="text"
                    value={formData.text}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="type">Тип вопроса*:</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="TEXT">Текстовый</option>
                    <option value="SINGLE_CHOICE">Одиночный выбор</option>
                    <option value="MULTIPLE_CHOICE">Множественный выбор</option>
                    <option value="RATING">Рейтинг</option>
                    <option value="DATE">Дата</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="category">Категория:</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="orderNumber">Порядковый номер:</label>
                  <input
                    type="number"
                    id="orderNumber"
                    name="orderNumber"
                    value={formData.orderNumber}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="required"
                      checked={formData.required}
                      onChange={handleInputChange}
                    />
                    Обязательный вопрос
                  </label>
                </div>

                {/* Варианты ответов для вопросов с выбором */}
                {(formData.type === "SINGLE_CHOICE" ||
                  formData.type === "MULTIPLE_CHOICE") && (
                  <div className="options-section">
                    <h3>Варианты ответов:</h3>

                    {loadingOptions ? (
                      <div className="loading-spinner">
                        Загрузка вариантов...
                      </div>
                    ) : (
                      <>
                        {formData.options.length === 0 ? (
                          <div className="no-options">Нет вариантов ответа</div>
                        ) : (
                          formData.options.map((option, index) => (
                            <div
                              key={option.id || index}
                              className="option-row"
                            >
                              <span className="option-number">
                                {index + 1}.
                              </span>
                              <input
                                type="text"
                                value={option.text}
                                onChange={e =>
                                  handleOptionChange(index, e.target.value)
                                }
                                placeholder="Текст варианта ответа"
                                required
                              />
                              <button
                                type="button"
                                className="btn-remove-option"
                                onClick={() => handleRemoveOption(index)}
                              >
                                Удалить
                              </button>
                            </div>
                          ))
                        )}

                        <button
                          type="button"
                          className="btn-add-option"
                          onClick={handleAddOption}
                        >
                          Добавить вариант
                        </button>
                      </>
                    )}
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-save"
                    disabled={loadingOptions}
                  >
                    Сохранить
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={closeModal}
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionsPage
