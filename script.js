document.currentScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
})();

const key = document.currentScript.dataset.key

const baseUrl = document.currentScript.dataset.url || 'https://sushilytics.com'

class Sushilytics {
    names = []

    observer = null

    constructor() {

    }

    start() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const idx = this.names.findIndex((record) => record.name === entry.target.getAttribute('data-sushi') && record.eventId === null)

                    if (idx >= 0) {
                        this.observer.unobserve(entry.target)

                        fetch(`${baseUrl}/api/projects/${key}/sushis/${this.names[idx].name}/sushi-events`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                            },
                        }).then(response => response.json()).then((json) => {
                            this.names[idx].eventId = json.id
                        })
                    }
                }
            })
        })

        this.names = Array.from(document.querySelectorAll('[data-sushi]')).map((el) => {
            if (el.checkVisibility !== undefined && !el.checkVisibility()) {
                return null
            }

            const name = el.getAttribute('data-sushi')
            if (name === null) {
                return null
            }

            el.addEventListener('mouseover', () => {
                const index = this.names.findIndex((record) => record.name === name && !record.hovered)
                if (index >= 0) {
                    this.names[index].hovered = true
                    fetch(`${baseUrl}/api/sushi-events/${this.names[index].eventId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                        body: JSON.stringify({ event: 'hover' }),
                    })
                }
            })

            el.addEventListener('click', () => {
                const index = this.names.findIndex((record) => record.name === name && !record.clicked)
                if (index >= 0) {
                    this.names[index].clicked = true
                    fetch(`${baseUrl}/api/sushi-events/${this.names[index].eventId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                        body: JSON.stringify({ event: 'click' }),
                    })
                }
            })

            this.observer.observe(el)

            return {
                name: name,
                eventId: null,
                hovered: false,
                clicked: false,
            }
        })

        if (this.names.length > 0) {
            fetch(`${baseUrl}/api/projects/${key}/sushis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    names: this.names.filter((record) => record !== null).map((record) => record.name),
                }),
            })
        }
    }
}

window.Sushilytics = new Sushilytics()
window.Sushilytics.start()
