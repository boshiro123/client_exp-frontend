import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { authService } from "../../api/auth"
import { surveyService } from "../../api/survey"
import { questionsService } from "../../api/questions"
import Sidebar from "../../components/common/Sidebar"
import "../../components/common/AuthStyles.css"
import "./DashboardStyles.css"

// SVG иконки для кнопок действий
const icons = {
  edit: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
        fill="currentColor"
      />
    </svg>
  ),
  preview: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
        fill="currentColor"
      />
    </svg>
  ),
  activate: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 5v14l11-7z" fill="currentColor" />
    </svg>
  ),
  stop: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 6h12v12H6z" fill="currentColor" />
    </svg>
  ),
  delete: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
        fill="currentColor"
      />
    </svg>
  ),
}

const DashboardPage = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [showSurveyForm, setShowSurveyForm] = useState(false)
  const [surveyData, setSurveyData] = useState({
    title: "",
    description: "",
    status: "DRAFT",
    startDate: "",
    endDate: "",
    questions: [
      {
        text: "Укажите ваш возраст",
        type: "single_choice",
        required: true,
        category: "Демографическая информация",
        options: [
          "До 18 лет",
          "18–25 лет",
          "26–35 лет",
          "36–45 лет",
          "46–60 лет",
          "60+ лет",
        ],
      },
      {
        text: "Из какого региона Беларуси вы?",
        type: "single_choice",
        required: true,
        category: "Географическая сегментация",
        options: [
          "Брестская область",
          "Витебская область",
          "Гомельская область",
          "Гродненская область",
          "Минская область",
          "Могилевская область",
          "г. Минск",
        ],
      },
      {
        text: "Ваша профессия или сфера деятельности",
        type: "single_choice",
        required: false,
        category: "Демографическая информация",
        options: [
          "Студент",
          "Фрилансер",
          "Офисный работник",
          "Руководитель/владелец бизнеса",
          "Другое",
        ],
      },
      {
        text: "Оцените вашу удовлетворенность нашей услугой по шкале от 1 до 5",
        type: "single_choice",
        required: true,
        category: "Сегментация по удовлетворенности",
        options: [
          "1 – Совсем не доволен",
          "2 – Скорее не доволен",
          "3 – Нейтрально",
          "4 – Скорее доволен",
          "5 – Полностью доволен",
        ],
      },
      {
        text: "Насколько вероятно, что вы порекомендуете нашу компанию друзьям?",
        type: "rating",
        required: true,
        category: "Сегментация по удовлетворенности",
        options: [],
      },
      {
        text: "Оцените удобство взаимодействия с нашей компанией через веб сайт",
        type: "single_choice",
        required: true,
        category: "Сегментация по удовлетворенности",
        options: [
          "1 – Очень легко",
          "2 – Скорее легко",
          "3 – Нейтрально",
          "4 – Скорее сложно",
          "5 – Очень сложно",
        ],
      },
      {
        text: "Какие аспекты нашей услуги вам понравились больше всего? (Можно выбрать несколько)",
        type: "multiple_choice",
        required: true,
        category: "Сегментация по удовлетворенности",
        options: ["Качество", "Скорость", "Цена", "Обслуживание", "Другое"],
      },
      {
        text: "Какие аспекты нашей услуги вам не понравились? (Можно выбрать несколько)",
        type: "multiple_choice",
        required: false,
        category: "Сегментация по удовлетворенности",
        options: ["Качество", "Скорость", "Цена", "Обслуживание", "Другое"],
      },
    ],
  })
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    type: "single_choice",
    required: false,
    category: "",
    options: [""],
  })
  const [categories, setCategories] = useState([
    "Демографическая информация",
    "Географическая сегментация",
    "Поведенческая сегментация",
    "Сегментация по удовлетворенности",
    "Сегментация по клиентскому пути",
    "Сегментация по мотивации и ценности клиента",
  ])
  const [newCategory, setNewCategory] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [surveys, setSurveys] = useState([])
  const [surveysFetching, setSurveysFetching] = useState(false)
  const [surveysError, setSurveysError] = useState("")

  // Состояния для работы с существующими вопросами
  const [existingQuestions, setExistingQuestions] = useState([])
  const [showExistingQuestions, setShowExistingQuestions] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [selectedExistingQuestions, setSelectedExistingQuestions] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      fetchSurveys()
    } else {
      navigate("/login")
    }
  }, [navigate])

  const fetchSurveys = async () => {
    setSurveysFetching(true)
    setSurveysError("")
    try {
      const response = await surveyService.getAllSurveys()
      console.log("Получены данные:", response)

      // Проверяем, есть ли поле content в ответе
      if (response && response.content && Array.isArray(response.content)) {
        console.log(
          `Получено ${response.content.length} опросников из поля content`
        )
        setSurveys(response.content)
      } else if (Array.isArray(response)) {
        // На случай, если API вернет просто массив
        console.log(`Получено ${response.length} опросников напрямую`)
        setSurveys(response)
      } else {
        console.log(
          "Ответ не содержит опросников в ожидаемом формате:",
          response
        )
        setSurveys([])
      }
    } catch (error) {
      console.error("Ошибка при получении опросников:", error)
      setSurveysError(
        "Не удалось загрузить опросники. Пожалуйста, попробуйте позже."
      )
      setSurveys([])
    } finally {
      setSurveysFetching(false)
    }
  }

  // Функция для загрузки существующих вопросов
  const fetchExistingQuestions = async () => {
    setLoadingQuestions(true)
    try {
      const questions = await questionsService.getAllQuestions()
      console.log("Получены существующие вопросы:", questions)
      setExistingQuestions(questions)
    } catch (error) {
      console.error("Ошибка при загрузке существующих вопросов:", error)
      alert("Не удалось загрузить существующие вопросы")
    } finally {
      setLoadingQuestions(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    navigate("/login")
  }

  const handleCreateSurvey = () => {
    // Сбрасываем форму на значения по умолчанию
    setSurveyData({
      title: "",
      description: "",
      status: "DRAFT",
      startDate: "",
      endDate: "",
      questions: [
        {
          text: "Укажите ваш возраст",
          type: "single_choice",
          required: true,
          category: "Демографическая информация",
          options: [
            "До 18 лет",
            "18–25 лет",
            "26–35 лет",
            "36–45 лет",
            "46–60 лет",
            "60+ лет",
          ],
        },
        {
          text: "Из какого региона Беларуси вы?",
          type: "single_choice",
          required: true,
          category: "Географическая сегментация",
          options: [
            "Брестская область",
            "Витебская область",
            "Гомельская область",
            "Гродненская область",
            "Минская область",
            "Могилевская область",
            "г. Минск",
          ],
        },
        {
          text: "Ваша профессия или сфера деятельности",
          type: "single_choice",
          required: false,
          category: "Демографическая информация",
          options: [
            "Студент",
            "Фрилансер",
            "Офисный работник",
            "Руководитель/владелец бизнеса",
            "Другое",
          ],
        },
        {
          text: "Оцените вашу удовлетворенность нашей услугой по шкале от 1 до 5",
          type: "single_choice",
          required: true,
          category: "Сегментация по удовлетворенности",
          options: [
            "1 – Совсем не доволен",
            "2 – Скорее не доволен",
            "3 – Нейтрально",
            "4 – Скорее доволен",
            "5 – Полностью доволен",
          ],
        },
        {
          text: "Насколько вероятно, что вы порекомендуете нашу компанию друзьям?",
          type: "rating",
          required: true,
          category: "Сегментация по удовлетворенности",
          options: [],
        },
        {
          text: "Оцените удобство взаимодействия с нашей компанией через веб сайт",
          type: "single_choice",
          required: true,
          category: "Сегментация по удовлетворенности",
          options: [
            "1 – Очень легко",
            "2 – Скорее легко",
            "3 – Нейтрально",
            "4 – Скорее сложно",
            "5 – Очень сложно",
          ],
        },
        {
          text: "Какие аспекты нашей услуги вам понравились больше всего? (Можно выбрать несколько)",
          type: "multiple_choice",
          required: true,
          category: "Сегментация по удовлетворенности",
          options: ["Качество", "Скорость", "Цена", "Обслуживание", "Другое"],
        },
        {
          text: "Какие аспекты нашей услуги вам не понравились? (Можно выбрать несколько)",
          type: "multiple_choice",
          required: false,
          category: "Сегментация по удовлетворенности",
          options: ["Качество", "Скорость", "Цена", "Обслуживание", "Другое"],
        },
      ],
    })

    // Очищаем сообщения об ошибках и успехе
    setErrorMessage("")
    setSuccessMessage("")

    // Показываем форму создания
    setShowSurveyForm(true)
  }

  const handleSurveyChange = e => {
    const { name, value } = e.target
    setSurveyData({
      ...surveyData,
      [name]: value,
    })
  }

  const handleQuestionChange = (e, index) => {
    const { name, value } = e.target
    const updatedQuestions = [...surveyData.questions]
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [name]: value,
    }
    setSurveyData({
      ...surveyData,
      questions: updatedQuestions,
    })
  }

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...surveyData.questions]
    updatedQuestions[questionIndex].options[optionIndex] = value
    setSurveyData({
      ...surveyData,
      questions: updatedQuestions,
    })
  }

  const addOption = questionIndex => {
    const updatedQuestions = [...surveyData.questions]
    updatedQuestions[questionIndex].options.push("")
    setSurveyData({
      ...surveyData,
      questions: updatedQuestions,
    })
  }

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...surveyData.questions]
    updatedQuestions[questionIndex].options.splice(optionIndex, 1)
    setSurveyData({
      ...surveyData,
      questions: updatedQuestions,
    })
  }

  const handleRequiredChange = index => {
    const updatedQuestions = [...surveyData.questions]
    updatedQuestions[index].required = !updatedQuestions[index].required
    setSurveyData({
      ...surveyData,
      questions: updatedQuestions,
    })
  }

  const handleNewQuestionChange = e => {
    const { name, value } = e.target
    setNewQuestion({
      ...newQuestion,
      [name]: value,
    })
  }

  const handleNewOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options]
    updatedOptions[index] = value
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions,
    })
  }

  const addNewOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, ""],
    })
  }

  const removeNewOption = index => {
    const updatedOptions = [...newQuestion.options]
    updatedOptions.splice(index, 1)
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions,
    })
  }

  const addNewQuestion = () => {
    if (newQuestion.text.trim() === "") {
      alert("Вопрос не может быть пустым")
      return
    }

    // Создаем копию вопроса с правильными options
    const questionToAdd = {
      ...newQuestion,
      options:
        newQuestion.type === "text" || newQuestion.type === "rating"
          ? []
          : newQuestion.options.filter(option => option.trim() !== ""),
    }

    setSurveyData({
      ...surveyData,
      questions: [...surveyData.questions, questionToAdd],
    })

    // Сбросить форму нового вопроса
    setNewQuestion({
      text: "",
      type: "single_choice",
      required: false,
      category: newQuestion.category,
      options: [""],
    })
  }

  const removeQuestion = index => {
    if (index < 8) {
      alert("Первые восемь вопросов являются базовыми и не могут быть удалены")
      return
    }

    const updatedQuestions = [...surveyData.questions]
    updatedQuestions.splice(index, 1)
    setSurveyData({
      ...surveyData,
      questions: updatedQuestions,
    })
  }

  const addCategory = () => {
    if (newCategory.trim() === "") return

    setCategories([...categories, newCategory])
    setNewCategory("")
  }

  // Функция для показа модального окна с существующими вопросами
  const handleShowExistingQuestions = () => {
    if (existingQuestions.length === 0) {
      fetchExistingQuestions()
    }
    setShowExistingQuestions(true)
    setSelectedExistingQuestions([])
    setSearchTerm("")
  }

  // Функция для закрытия модального окна
  const handleCloseExistingQuestions = () => {
    setShowExistingQuestions(false)
    setSelectedExistingQuestions([])
    setSearchTerm("")
  }

  // Функция для выбора/отмены выбора существующего вопроса
  const toggleExistingQuestion = question => {
    // Теперь выбираем только один вопрос
    if (
      selectedExistingQuestions.length > 0 &&
      selectedExistingQuestions[0].id === question.id
    ) {
      setSelectedExistingQuestions([])
    } else {
      setSelectedExistingQuestions([question])
    }
  }

  // Функция для заполнения формы выбранным вопросом
  const fillFormWithSelectedQuestion = () => {
    if (selectedExistingQuestions.length === 0) return

    const question = selectedExistingQuestions[0]

    // Дополнительная проверка на дублирование
    const isDuplicate = surveyData.questions.some(
      q => q.text.toLowerCase().trim() === question.text.toLowerCase().trim()
    )

    if (isDuplicate) {
      alert("Этот вопрос уже добавлен в опросник!")
      return
    }

    // Преобразуем формат из базы вопросов в формат формы
    let type = question.type
    if (type === "SINGLE_CHOICE") type = "single_choice"
    else if (type === "MULTIPLE_CHOICE") type = "multiple_choice"
    else if (type === "TEXT") type = "text"
    else if (type === "RATING") type = "rating"
    else type = type.toLowerCase()

    // Заполняем форму нового вопроса
    setNewQuestion({
      text: question.text,
      type: type,
      required: question.required || false,
      category: question.category || "",
      options:
        type === "text" || type === "rating"
          ? [""]
          : question.options && question.options.length > 0
          ? question.options
          : [""],
    })

    handleCloseExistingQuestions()

    // Показываем уведомление
    alert(
      "Вопрос загружен в форму. Вы можете отредактировать его перед добавлением."
    )
  }

  // Функция для фильтрации вопросов по поисковому запросу
  const getFilteredQuestions = () => {
    if (!searchTerm.trim()) return existingQuestions

    return existingQuestions.filter(
      question =>
        question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (question.category &&
          question.category.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }

  const saveSurvey = async () => {
    // Валидация данных опросника перед отправкой
    if (!surveyData.title.trim()) {
      setErrorMessage("Необходимо указать название опросника")
      return
    }

    if (surveyData.questions.length < 3) {
      setErrorMessage("Опросник должен содержать минимум 3 вопроса")
      return
    }

    // Сброс сообщений об ошибках/успехе
    setErrorMessage("")
    setSuccessMessage("")
    setIsLoading(true)

    try {
      // Преобразуем данные в формат, ожидаемый сервером
      const serverData = {
        ...surveyData,
        // Преобразуем статус к верхнему регистру, если он в верблюжьем регистре
        status:
          surveyData.status === "черновик"
            ? "DRAFT"
            : surveyData.status === "активный"
            ? "ACTIVE"
            : surveyData.status === "завершенный"
            ? "COMPLETED"
            : surveyData.status,
        // Добавляем порядковые номера вопросам
        questions: surveyData.questions.map((question, index) => ({
          ...question,
          orderNumber: index + 1,
          // Преобразуем тип вопроса к формату сервера
          type:
            question.type === "single_choice"
              ? "SINGLE_CHOICE"
              : question.type === "multiple_choice"
              ? "MULTIPLE_CHOICE"
              : question.type === "text"
              ? "TEXT"
              : question.type === "rating"
              ? "RATING"
              : question.type.toUpperCase(),
          // Очищаем options для TEXT и RATING вопросов
          options:
            question.type === "text" || question.type === "TEXT"
              ? []
              : question.type === "rating" || question.type === "RATING"
              ? []
              : question.options.filter(option => option.trim() !== ""),
        })),
      }

      console.log("Отправка данных на сервер:", serverData)

      let response
      let successMsg

      // Если у опросника есть id, то это обновление, иначе - создание
      if (surveyData.id) {
        // Обновление существующего опросника
        response = await surveyService.updateSurvey(surveyData.id, serverData)
        successMsg = "Опросник успешно обновлен!"
      } else {
        // Создание нового опросника
        response = await surveyService.createSurvey(serverData)
        successMsg = "Опросник успешно создан!"
      }

      console.log("Опросник успешно сохранен:", response)
      setSuccessMessage(successMsg)

      // Обновляем список опросников
      fetchSurveys()

      // Сброс формы и возврат к главному экрану через 2 секунды
      setTimeout(() => {
        setShowSurveyForm(false)
        setSuccessMessage("")
      }, 2000)
    } catch (error) {
      console.error("Ошибка при сохранении опросника:", error)

      let errorMsg =
        "Произошла ошибка при сохранении опросника. Пожалуйста, попробуйте позже."

      // Обработка различных типов ошибок
      if (error.response) {
        // Ошибка от сервера с кодом статуса
        errorMsg =
          error.response.data?.message ||
          `Ошибка сервера: ${error.response.status} - ${error.response.statusText}`
      } else if (error.request) {
        // Ошибка сети - запрос был отправлен, но ответ не получен
        errorMsg = "Сервер не отвечает. Проверьте подключение к Интернету."
      } else {
        // Ошибка при настройке запроса
        errorMsg = `Ошибка при создании запроса: ${error.message}`
      }

      setErrorMessage(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const cancelSurveyCreation = () => {
    if (
      window.confirm(
        "Вы уверены, что хотите отменить создание опросника? Все введенные данные будут потеряны."
      )
    ) {
      setShowSurveyForm(false)
    }
  }

  const handleEditSurvey = async id => {
    try {
      setIsLoading(true)
      // Получаем детальную информацию об опроснике с сервера
      const surveyDetails = await surveyService.getSurveyById(id)
      console.log(
        "Получены данные опросника для редактирования:",
        surveyDetails
      )

      // Преобразуем вопросы из формата сервера в формат интерфейса
      const transformedQuestions = surveyDetails.questions.map(question => ({
        ...question,
        // Преобразуем тип вопроса из формата сервера в формат интерфейса
        type:
          question.type === "SINGLE_CHOICE"
            ? "single_choice"
            : question.type === "MULTIPLE_CHOICE"
            ? "multiple_choice"
            : question.type === "TEXT"
            ? "text"
            : question.type === "RATING"
            ? "rating"
            : question.type.toLowerCase(),
      }))

      // Устанавливаем данные опросника в состояние формы
      setSurveyData({
        ...surveyDetails,
        questions: transformedQuestions,
      })

      // Показываем форму для редактирования
      setShowSurveyForm(true)
      setIsLoading(false)
    } catch (error) {
      console.error("Ошибка при получении данных опросника:", error)
      alert(
        "Не удалось загрузить опросник для редактирования. Пожалуйста, попробуйте позже."
      )
      setIsLoading(false)
    }
  }

  const handleDeleteSurvey = async id => {
    if (window.confirm("Вы уверены, что хотите удалить этот опросник?")) {
      try {
        setIsLoading(true)

        await surveyService.deleteSurvey(id)

        // Показываем временное уведомление об успехе
        setSuccessMessage("Опросник успешно удален")
        setTimeout(() => setSuccessMessage(""), 3000)

        // Обновить список опросников после удаления
        fetchSurveys()
        setIsLoading(false)
      } catch (error) {
        console.error("Ошибка при удалении опросника:", error)

        let errorMsg =
          "Не удалось удалить опросник. Пожалуйста, попробуйте позже."

        // Обработка различных типов ошибок
        if (error.response) {
          errorMsg =
            error.response.data?.message ||
            `Ошибка сервера: ${error.response.status} - ${error.response.statusText}`
        }

        setErrorMessage(errorMsg)
        setTimeout(() => setErrorMessage(""), 3000)
        setIsLoading(false)
      }
    }
  }

  const handleChangeSurveyStatus = async (id, newStatus) => {
    try {
      setIsLoading(true)

      // Преобразуем статус в формат сервера
      const serverStatus =
        newStatus === "активный"
          ? "ACTIVE"
          : newStatus === "завершенный"
          ? "COMPLETED"
          : newStatus === "черновик"
          ? "DRAFT"
          : newStatus

      // Получаем русское название статуса для уведомления
      const statusDisplayName =
        serverStatus === "ACTIVE"
          ? "активный"
          : serverStatus === "COMPLETED"
          ? "завершенный"
          : serverStatus === "DRAFT"
          ? "черновик"
          : serverStatus

      await surveyService.changeSurveyStatus(id, serverStatus)

      // Показываем временное уведомление об успехе
      setSuccessMessage(`Статус опросника изменен на "${statusDisplayName}"`)
      setTimeout(() => setSuccessMessage(""), 3000)

      // Обновить список опросников после изменения статуса
      fetchSurveys()
      setIsLoading(false)
    } catch (error) {
      console.error("Ошибка при изменении статуса опросника:", error)

      let errorMsg =
        "Не удалось изменить статус опросника. Пожалуйста, попробуйте позже."

      // Обработка различных типов ошибок
      if (error.response) {
        errorMsg =
          error.response.data?.message ||
          `Ошибка сервера: ${error.response.status} - ${error.response.statusText}`
      }

      setErrorMessage(errorMsg)
      setTimeout(() => setErrorMessage(""), 3000)
      setIsLoading(false)
    }
  }

  const getStatusColor = status => {
    switch (status) {
      case "черновик":
      case "DRAFT":
        return "#6c757d" // серый
      case "активный":
      case "ACTIVE":
        return "#28a745" // зеленый
      case "завершенный":
      case "COMPLETED":
        return "#dc3545" // красный
      default:
        return "#6c757d"
    }
  }

  const getStatusDisplayText = status => {
    switch (status) {
      case "DRAFT":
        return "Черновик"
      case "ACTIVE":
        return "Активный"
      case "COMPLETED":
        return "Завершенный"
      default:
        return status
    }
  }

  const formatDate = dateString => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU")
  }

  if (!user) {
    return <div>Загрузка...</div>
  }

  return (
    <div className="dashboard-container">
      <Sidebar user={user} />
      <div className="dashboard-content">
        {!showSurveyForm ? (
          <div className="dashboard-actions">
            <h2>Добро пожаловать, {user.username}!</h2>
            <p>
              Управляйте клиентским опытом с помощью создания и анализа
              опросников.
            </p>

            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}

            <div className="action-buttons">
              <button className="primary-button" onClick={handleCreateSurvey}>
                Создать новый опросник
              </button>
            </div>

            <div className="surveys-list-section">
              <h3>Мои опросники</h3>

              {surveysFetching && (
                <div className="loading-indicator">Загрузка опросников...</div>
              )}
              {surveysError && (
                <div className="error-message">{surveysError}</div>
              )}

              {!surveysFetching && !surveysError && surveys.length === 0 && (
                <div className="empty-state">
                  <p>У вас пока нет созданных опросников.</p>
                </div>
              )}

              {!surveysFetching && !surveysError && surveys.length > 0 && (
                <div className="surveys-table-container">
                  <table className="surveys-table">
                    <thead>
                      <tr>
                        <th>Название</th>
                        <th>Статус</th>
                        <th>Дата начала</th>
                        <th>Дата окончания</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {surveys.map(survey => (
                        <tr key={survey.id}>
                          <td>{survey.title}</td>
                          <td>
                            <span
                              className="status-badge"
                              style={{
                                backgroundColor: getStatusColor(survey.status),
                              }}
                            >
                              {getStatusDisplayText(survey.status)}
                            </span>
                          </td>
                          <td>{formatDate(survey.startDate)}</td>
                          <td>{formatDate(survey.endDate)}</td>
                          <td>
                            <div className="survey-actions">
                              <button
                                className="action-button edit-button"
                                onClick={() => handleEditSurvey(survey.id)}
                                title="Редактировать"
                              >
                                {icons.edit}
                              </button>

                              <button
                                className="action-button preview-button"
                                onClick={() => navigate(`/survey/${survey.id}`)}
                                title="Предпросмотр"
                              >
                                {icons.preview}
                              </button>

                              {survey.status !== "активный" &&
                                survey.status !== "ACTIVE" && (
                                  <button
                                    className="action-button activate-button"
                                    onClick={() =>
                                      handleChangeSurveyStatus(
                                        survey.id,
                                        "активный"
                                      )
                                    }
                                    title="Активировать"
                                  >
                                    {icons.activate}
                                  </button>
                                )}

                              {(survey.status === "активный" ||
                                survey.status === "ACTIVE") && (
                                <button
                                  className="action-button complete-button"
                                  onClick={() =>
                                    handleChangeSurveyStatus(
                                      survey.id,
                                      "завершенный"
                                    )
                                  }
                                  title="Завершить"
                                >
                                  {icons.stop}
                                </button>
                              )}

                              <button
                                className="action-button delete-button"
                                onClick={() => handleDeleteSurvey(survey.id)}
                                title="Удалить"
                              >
                                {icons.delete}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="survey-form">
            <h2>Создание нового опросника</h2>

            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}

            <div className="form-section">
              <h3>Основная информация</h3>
              <div className="form-group">
                <label htmlFor="title">Название опросника:</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-control"
                  value={surveyData.title}
                  onChange={handleSurveyChange}
                  placeholder="Введите название опросника"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Описание:</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  value={surveyData.description}
                  onChange={handleSurveyChange}
                  placeholder="Введите описание опросника"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group half-width">
                  <label htmlFor="startDate">Дата начала:</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    className="form-control"
                    value={surveyData.startDate}
                    onChange={handleSurveyChange}
                  />
                </div>

                <div className="form-group half-width">
                  <label htmlFor="endDate">Дата окончания:</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    className="form-control"
                    value={surveyData.endDate}
                    onChange={handleSurveyChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="status">Статус:</label>
                <select
                  id="status"
                  name="status"
                  className="form-select"
                  value={surveyData.status}
                  onChange={handleSurveyChange}
                >
                  <option value="DRAFT">Черновик</option>
                  <option value="ACTIVE">Активный</option>
                  <option value="COMPLETED">Завершенный</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <h3>Вопросы опросника</h3>
              <p className="info-text">
                Первые восемь вопросов являются базовыми и присутствуют во всех
                опросниках.
              </p>

              {surveyData.questions.map((question, index) => (
                <div key={index} className="question-card">
                  <div className="question-header">
                    <h4>Вопрос {index + 1}</h4>
                    {index >= 8 && (
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => removeQuestion(index)}
                      >
                        Удалить
                      </button>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor={`question-${index}`}>Текст вопроса:</label>
                    <input
                      type="text"
                      id={`question-${index}`}
                      name="text"
                      className="form-control"
                      value={question.text}
                      onChange={e => handleQuestionChange(e, index)}
                      placeholder="Введите текст вопроса"
                      disabled={index < 8} // Первые восемь вопросов нельзя изменять
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group half-width">
                      <label htmlFor={`type-${index}`}>Тип вопроса:</label>
                      <select
                        id={`type-${index}`}
                        name="type"
                        className="form-select"
                        value={question.type}
                        onChange={e => handleQuestionChange(e, index)}
                        disabled={index < 8}
                      >
                        <option value="single_choice">
                          Один вариант ответа
                        </option>
                        <option value="multiple_choice">
                          Несколько вариантов ответа
                        </option>
                        <option value="text">Текстовый ответ</option>
                        <option value="rating">Оценка</option>
                      </select>
                    </div>

                    <div className="form-group half-width">
                      <label htmlFor={`category-${index}`}>Категория:</label>
                      <select
                        id={`category-${index}`}
                        name="category"
                        className="form-select"
                        value={question.category}
                        onChange={e => handleQuestionChange(e, index)}
                        disabled={index < 8}
                      >
                        {categories.map((category, i) => (
                          <option key={i} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group checkbox-group">
                    <input
                      type="checkbox"
                      id={`required-${index}`}
                      checked={question.required}
                      onChange={() => handleRequiredChange(index)}
                      disabled={index < 8}
                    />
                    <label htmlFor={`required-${index}`}>
                      Обязательный вопрос
                    </label>
                  </div>

                  {(question.type === "single_choice" ||
                    question.type === "multiple_choice") && (
                    <div className="options-container">
                      <label>Варианты ответов:</label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="option-row">
                          <input
                            type="text"
                            className="form-control"
                            value={option}
                            onChange={e =>
                              handleOptionChange(
                                index,
                                optionIndex,
                                e.target.value
                              )
                            }
                            placeholder={`Вариант ${optionIndex + 1}`}
                            disabled={index < 8}
                          />
                          {question.options.length > 1 && index >= 8 && (
                            <button
                              type="button"
                              className="delete-option-button"
                              onClick={() => removeOption(index, optionIndex)}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      {index >= 8 && (
                        <button
                          type="button"
                          className="add-option-button"
                          onClick={() => addOption(index)}
                        >
                          + Добавить вариант
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div className="add-question-form">
                <div className="add-question-header">
                  <h4>Создать новый вопрос</h4>
                  <button
                    type="button"
                    className="secondary-button small-button"
                    onClick={handleShowExistingQuestions}
                  >
                    Добавить из базы
                  </button>
                </div>

                <div className="form-group">
                  <label htmlFor="newQuestionText">Текст вопроса:</label>
                  <input
                    type="text"
                    id="newQuestionText"
                    name="text"
                    className="form-control"
                    value={newQuestion.text}
                    onChange={handleNewQuestionChange}
                    placeholder="Введите текст вопроса"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group half-width">
                    <label htmlFor="newQuestionType">Тип вопроса:</label>
                    <select
                      id="newQuestionType"
                      name="type"
                      className="form-select"
                      value={newQuestion.type}
                      onChange={handleNewQuestionChange}
                    >
                      <option value="single_choice">Один вариант ответа</option>
                      <option value="multiple_choice">
                        Несколько вариантов ответа
                      </option>
                      <option value="text">Текстовый ответ</option>
                      <option value="rating">Оценка</option>
                    </select>
                  </div>

                  <div className="form-group half-width">
                    <label htmlFor="newQuestionCategory">Категория:</label>
                    <select
                      id="newQuestionCategory"
                      name="category"
                      className="form-select"
                      value={newQuestion.category}
                      onChange={handleNewQuestionChange}
                    >
                      <option value="">Выберите категорию</option>
                      {categories.map((category, i) => (
                        <option key={i} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="newQuestionRequired"
                    name="required"
                    checked={newQuestion.required}
                    onChange={() =>
                      setNewQuestion({
                        ...newQuestion,
                        required: !newQuestion.required,
                      })
                    }
                  />
                  <label htmlFor="newQuestionRequired">
                    Обязательный вопрос
                  </label>
                </div>

                {(newQuestion.type === "single_choice" ||
                  newQuestion.type === "multiple_choice") && (
                  <div className="options-container">
                    <label>Варианты ответов:</label>
                    {newQuestion.options.map((option, index) => (
                      <div key={index} className="option-row">
                        <input
                          type="text"
                          className="form-control"
                          value={option}
                          onChange={e =>
                            handleNewOptionChange(index, e.target.value)
                          }
                          placeholder={`Вариант ${index + 1}`}
                        />
                        {newQuestion.options.length > 1 && (
                          <button
                            type="button"
                            className="delete-option-button"
                            onClick={() => removeNewOption(index)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="add-option-button"
                      onClick={addNewOption}
                    >
                      + Добавить вариант
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  className="add-button"
                  onClick={addNewQuestion}
                  style={{ marginTop: "10px" }}
                >
                  Добавить вопрос
                </button>
              </div>

              <div className="add-category-form">
                <h4>Добавить новую категорию</h4>
                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      placeholder="Название новой категории"
                      style={{
                        // marginBottom: "10px",
                        width: "100%",
                        minWidth: "250px",
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="add-button"
                    onClick={addCategory}
                    style={{ marginBottom: "10px" }}
                  >
                    Добавить категорию
                  </button>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="primary-button"
                onClick={saveSurvey}
                disabled={isLoading}
              >
                {isLoading ? "Сохранение..." : "Сохранить опросник"}
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={cancelSurveyCreation}
                disabled={isLoading}
              >
                Отменить
              </button>
            </div>
          </div>
        )}

        {/* Модальное окно для выбора существующих вопросов */}
        {showExistingQuestions && (
          <div className="modal-overlay" onClick={handleCloseExistingQuestions}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Выбрать вопрос из базы</h3>
                <button
                  className="modal-close-button"
                  onClick={handleCloseExistingQuestions}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                {/* Поиск */}
                <div className="search-section">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Поиск по тексту вопроса или категории..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Загрузка */}
                {loadingQuestions && (
                  <div className="loading-indicator">Загрузка вопросов...</div>
                )}

                {/* Список вопросов */}
                {!loadingQuestions && (
                  <div className="questions-list">
                    {getFilteredQuestions().length === 0 ? (
                      <div className="empty-state">
                        <p>Вопросы не найдены</p>
                      </div>
                    ) : (
                      <>
                        <div className="questions-summary">
                          Найдено: {getFilteredQuestions().length}, доступно:{" "}
                          {
                            getFilteredQuestions().filter(
                              q =>
                                !surveyData.questions.some(
                                  sq =>
                                    sq.text.toLowerCase().trim() ===
                                    q.text.toLowerCase().trim()
                                )
                            ).length
                          }
                        </div>
                        {getFilteredQuestions().map(question => {
                          const isSelected = selectedExistingQuestions.some(
                            q => q.id === question.id
                          )
                          const isDuplicate = surveyData.questions.some(
                            q =>
                              q.text.toLowerCase().trim() ===
                              question.text.toLowerCase().trim()
                          )

                          return (
                            <div
                              key={question.id}
                              className={`question-item ${
                                isSelected ? "selected" : ""
                              } ${isDuplicate ? "duplicate" : ""}`}
                              onClick={() =>
                                !isDuplicate && toggleExistingQuestion(question)
                              }
                            >
                              <div className="question-checkbox">
                                <input
                                  type="radio"
                                  checked={isSelected}
                                  onChange={() =>
                                    !isDuplicate &&
                                    toggleExistingQuestion(question)
                                  }
                                  name="selectedQuestion"
                                  disabled={isDuplicate}
                                />
                              </div>

                              <div className="question-details">
                                <div className="question-text">
                                  {question.text}
                                  {isDuplicate && (
                                    <span className="duplicate-label">
                                      (уже добавлен)
                                    </span>
                                  )}
                                </div>
                                <div className="question-meta">
                                  <span className="question-type">
                                    {question.type === "SINGLE_CHOICE"
                                      ? "Один вариант"
                                      : question.type === "MULTIPLE_CHOICE"
                                      ? "Несколько вариантов"
                                      : question.type === "TEXT"
                                      ? "Текст"
                                      : question.type === "RATING"
                                      ? "Рейтинг"
                                      : question.type}
                                  </span>
                                  {question.category && (
                                    <span className="question-category">
                                      • {question.category}
                                    </span>
                                  )}
                                  {question.required && (
                                    <span className="question-required">
                                      • Обязательный
                                    </span>
                                  )}
                                </div>
                                {question.options &&
                                  question.options.length > 0 && (
                                    <div className="question-options-preview">
                                      Варианты:{" "}
                                      {question.options.slice(0, 3).join(", ")}
                                      {question.options.length > 3 && "..."}
                                    </div>
                                  )}
                              </div>
                            </div>
                          )
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <div className="selected-count">
                  {selectedExistingQuestions.length > 0
                    ? "Выбран 1 вопрос"
                    : "Выберите вопрос"}
                </div>
                <div className="modal-actions">
                  <button
                    className="secondary-button"
                    onClick={handleCloseExistingQuestions}
                  >
                    Отмена
                  </button>
                  <button
                    className="primary-button"
                    onClick={fillFormWithSelectedQuestion}
                    disabled={selectedExistingQuestions.length === 0}
                  >
                    Добавить выбранный вопрос
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
