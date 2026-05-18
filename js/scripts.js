
let aboutMeData = null
let projectsData = null


const safeValue = (value, fallback = '') => value ?? fallback

const fetchAboutMe = async () => {
    try {
        const response = await fetch('./starter/data/aboutMeData.json')

        if (!response.ok) {
            throw new Error(`Error fetching aboutMe: ${response.status} ${response.statusText}`)
        }

        aboutMeData = await response.json()
        buildAboutMe()

    } catch (error) {
        console.log('fetchAboutMe error:', error)
    }
}


const fetchProjects = async () => {
    try {
        const response = await fetch('../starter/data/projectsData.json')

        if (!response.ok) {
            throw new Error(`Error fetching projects: ${response.status} ${response.statusText}`)
        }

        projectsData = await response.json()
        buildProjects()

    } catch (error) {
        console.log('fetchProjects error:', error)
    }
}



const buildAboutMe = () => {
    const aboutMeSection = document.querySelector('#aboutMe')

    // Bio paragraph
    const bio = document.createElement('p')
    bio.textContent = safeValue(aboutMeData.about_me, 'No bio available.')

    // Headshot container
    const headshotContainer = document.createElement('div')
    headshotContainer.classList.add('headshotContainer')

    // Headshot image
    const headshot = document.createElement('img')
    headshot.src = safeValue(aboutMeData.headshot, '../starter/images/card_placeholder_bg.webp')
    headshot.alt = 'Profile headshot'

    headshotContainer.append(headshot)
    aboutMeSection.append(bio, headshotContainer)
}


const buildProjects = () => {
    const projectList = document.querySelector('#projectList')
    const fragment = document.createDocumentFragment()

    projectsData.forEach((project) => {
        const card = document.createElement('div')
        card.classList.add('projectCard')

        card.id = safeValue(project.project_id, '')

        const cardImage = safeValue(project.card_image, '../starter/images/card_placeholder_bg.webp')
        card.style.backgroundImage = `url('${cardImage}')`

        // Project title
        const title = document.createElement('h4')
        title.textContent = safeValue(project.project_name, 'Untitled Project')

        // Short  description
        const description = document.createElement('p')
        description.textContent = safeValue(project.short_description, 'No description available.')

        card.append(title, description)
        fragment.append(card)
    })

    // One DOM update — efficient!
    projectList.append(fragment)

    // Default spotlight = first card in array (rubric requirement)
    if (projectsData.length > 0) {
        updateSpotlight(projectsData[0])
    }

    // ONE listener on parent container — event delegation
    projectList.addEventListener('pointerdown', handleCardClick)
}



const updateSpotlight = (project) => {
    const spotlight = document.querySelector('#projectSpotlight')
    const spotlightTitles = document.querySelector('#spotlightTitles')

    const spotlightImage = safeValue(project.spotlight_image, '../starter/images/spotlight_placeholder_bg.webp')
    spotlight.style.backgroundImage = `url('${spotlightImage}')`

    spotlightTitles.innerHTML = ''

    // Project name
    const name = document.createElement('h3')
    name.textContent = safeValue(project.project_name, 'Untitled Project')

    // Long description
    const description = document.createElement('p')
    description.textContent = safeValue(project.long_description, 'No description available.')

    // External link
    const link = document.createElement('a')
    link.href = safeValue(project.url, '#')
    link.textContent = 'Click here to see more...'

    spotlightTitles.append(name, description, link)
}


const handleCardClick = (event) => {
    const card = event.target.closest('.projectCard')
    if (!card) return

    const project = projectsData.find(p => String(p.project_id) === String(card.id))

    if (project) {
        updateSpotlight(project)
    }
}



let scrollInterval = null

const startScroll = (direction) => {
    const projectList = document.querySelector('#projectList')
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const scrollAmount = 10 

    const doScroll = () => {
        if (isMobile) {
            projectList.scrollBy({ left: direction === 'next' ? scrollAmount : -scrollAmount })
        } else {
            projectList.scrollBy({ top: direction === 'next' ? scrollAmount : -scrollAmount })
        }
    }

    doScroll() 
    scrollInterval = setInterval(doScroll, 16) 
}

const stopScroll = () => {
    clearInterval(scrollInterval)
    scrollInterval = null
}



const illegalCharsRegex = /[^a-zA-Z0-9@._\- ]/
const validEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const showError = (elementId, message) => {
    const errorDiv = document.querySelector(`#${elementId}`)
    if (errorDiv) errorDiv.textContent = message
}

const clearError = (elementId) => {
    const errorDiv = document.querySelector(`#${elementId}`)
    if (errorDiv) errorDiv.textContent = ''
}

const validateEmail = (email) => {
    if (!email) return 'Email cannot be empty.'
    if (illegalCharsRegex.test(email)) return 'Email contains illegal characters.'
    if (!validEmailRegex.test(email)) return 'Please enter a valid email address.'
    return null // null = valid
}

const validateMessage = (message) => {
    if (!message) return 'Message cannot be empty.'
    if (illegalCharsRegex.test(message)) return 'Message contains illegal characters.'
    if (message.length > 300) return `Message is too long (${message.length}/300 characters).`
    return null // null = valid
}



const handleFormSubmit = (event) => {
    event.preventDefault() // no page refresh

    const emailInput = document.querySelector('#contactEmail')
    const messageInput = document.querySelector('#contactMessage')

    const emailValue = emailInput.value.trim()
    const messageValue = messageInput.value.trim()

    const emailError = validateEmail(emailValue)
    const messageError = validateMessage(messageValue)

    emailError ? showError('emailError', emailError) : clearError('emailError')
    messageError ? showError('messageError', messageError) : clearError('messageError')

    if (!emailError && !messageError) {
        alert('Validation successful! Your message has been submitted.')
        event.target.reset()
        updateCharCount(0)
    }
}


const updateCharCount = (count) => {
    const charCount = document.querySelector('#charactersLeft')
    if (!charCount) return

    charCount.textContent = `Characters: ${count}/300`

    if (count > 300) {
        charCount.classList.add('error')
    } else {
        charCount.classList.remove('error')
    }
}

const handleMessageInput = (event) => {
    updateCharCount(event.target.value.length)
}


const init = () => {
    fetchAboutMe()
    fetchProjects()

    const prevArrow = document.querySelector('.arrow-left')
    const nextArrow = document.querySelector('.arrow-right')

    prevArrow?.addEventListener('pointerdown', () => startScroll('prev'))
    nextArrow?.addEventListener('pointerdown', () => startScroll('next'))

    ;[prevArrow, nextArrow].forEach(arrow => {
        arrow?.addEventListener('pointerup', stopScroll)
        arrow?.addEventListener('pointerleave', stopScroll)
    })

    const form = document.querySelector('#formSection')
    form?.addEventListener('submit', handleFormSubmit)

    const messageInput = document.querySelector('#contactMessage')
    messageInput?.addEventListener('input', handleMessageInput)
    updateCharCount(0)
}

// Go!
init()