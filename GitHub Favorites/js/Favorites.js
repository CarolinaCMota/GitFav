// uma nova classe pra buscar as informações do github
export class GithubUser {
    static search(username) {
        const endpoint = `https://api.github.com/users/${username}`
        return fetch(endpoint)
            .then(data => data.json())
            .then(data => ({
                login: data.login,
                name: data.name,
                public_repos: data.public_repos,
                followers: data.followers,
                avatar_url: data.avatar_url,
            }))
    }
}


// uma classe que vai conter a logica dos dados e como os dados serao estruturados

export class Favorites {
    constructor() {
        this.load();
    }

    load() {
        const favorites = JSON.parse(localStorage.getItem('@github-favorites:')) || []

        this.favorites = favorites
    }

    async add(username) {
        const user = await GithubUser.search(username);
        this.favorites.push(user);
    }

    delete(user) {
        //higher-order functions map filter e tal
        const filteredEntries = this.favorites.filter(favorite => favorite.login !== user.login)

        this.favorites = filteredEntries
    }
}

//outra classe q vai criar a visualizacao e eventos do HTML
export class FavoritesView extends Favorites {
    constructor(root) {
        super()

        this.root = document.querySelector(root);

        this.tbody = this.root.querySelector('table tbody')

        this.atualizarATelaComOsFavoritos()
        this.onadd()
    }

    onadd() {
        const addButton = this.root.querySelector('.search button')
        addButton.onclick = async () => {
            const { value } = this.root.querySelector('.search input')
            await this.add(value)
            this.atualizarATelaComOsFavoritos();
        }

    }
    atualizarATelaComOsFavoritos() {
        this.removeTodasAsLinhas()

        this.favorites.forEach(user => {
            const row = this.creatRow(user)
      

            row.querySelector('.remove').onclick = () => {
                const isOk = confirm('Tem certeza que deseja deletar essa linha?')
                if (isOk) {
                    this.delete(user)
                    this.atualizarATelaComOsFavoritos()
                }
            }

            this.tbody.append(row)
        })

    }

    creatRow(user) {
        const tr = document.createElement("tr")

        const content = `
            <td class="user">
                <img src="${user.avatar_url}" alt="imagem de ${user.login}">
                <a href="https://github.com/${user.login}">
                    <p>${user.name}</p>
                    <span>${user.login}</span>
                </a>
            </td>
            <td class="repositories">
                ${user.public_repos}
            </td>
            <td class="followers">
                ${user.followers}
            </td>
            <td>
                <button class="remove">&times;</button>
            </td>
        `;

        tr.innerHTML = content;

        return tr
    }

    removeTodasAsLinhas() {
        this.tbody.querySelectorAll('tr')
            .forEach((tr) => {
                tr.remove()
            })

    }
}
