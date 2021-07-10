const loadDogsBreeds = async () => {
    try{
        let response = await fetch("https://dog.ceo/api/breeds/list/all")
        let dogs = await response.json()
        return dogs
    }catch(e) {
        return "Enable to load dog breed"
    }

}

let pageIsLoading = true
let isSearchAvailable = false
let option
let select = document.querySelector('#selectBox')
let searchBox = document.querySelector('#searchBox')
let randomDisplay = document.querySelector('.randomImg')
let searchHeader = document.querySelector('#display-header')
let autoSuggestBox = document.querySelector('.auto-suggest')
let desc = document.querySelector('.desc')
let dogImage = document.querySelector('.dog-img')
let searchBtn = document.querySelector('#search-btn')
let page = document.querySelector('.isloading')

const isLoading = () => {
    page.classList.add('open')
    page.innerHTML='<div class="loading"><img src="img/loading.svg"></div>'
}
const isLoaded = () => {
    page.classList.remove('open')
}


loadDogsBreeds().then(data => {
    Object.keys(data.message).forEach(breed => {
        if(data.message[breed].length == 0) {
            option = new Option(breed, breed)
            select.add(option, undefined)
        }else {
            data.message[breed].forEach(breedType => {
                option = new Option(breedType+' '+breed, breedType+' '+breed)
                select.add(option, undefined)
            })
        }
       
    })
    
})

const getDogBreeds = async () => {
    let dogsBreeds = await fetch("https://api.thedogapi.com/v1/breeds/")
    dogsBreeds = await dogsBreeds.json()
    return dogsBreeds
}
const getDogImages = async (name) => {
    try {
        name = name.toLowerCase()
        let splitVal = name.split(' ')
    
        if(splitVal.length >= 2) {
            let resp = await fetch(`https://dog.ceo/api/breed/${splitVal[1]}/${splitVal[0]}/images/random/8`)
            if(resp.status == 200) {
                resp = await resp.json()
                return resp
            }
            
        }else {
            let resp = await fetch(`https://dog.ceo/api/breed/${splitVal[0]}/images/random/8`)
            if(resp.status == 200) {
                resp = await resp.json()
                return resp
            }
            
        }
    } catch (error) {
        //return error
        return "Unable to fetch sub breed"
    }
}

//Persist and fetch data from local storage
const dataStore = () => {
    if (localStorage.getItem("dogs")) {
       return JSON.parse(localStorage.getItem("dogs"))

    }else {
    getDogBreeds().then(response => {
        localStorage.setItem('dogs', JSON.stringify(response)) 
    }) 
    }
}

//Find a dog breed from local storage
const findDog = (name, dataStore) => {
   let res = dataStore.filter(breed => breed.name.toLowerCase().includes(name.toLowerCase()) )
   return res
}

//Fetch random dog images
const getRandomImages = async () => {
    let response = await fetch("https://dog.ceo/api/breeds/image/random/8")
    response = response.json()
    return response
}

//functions to display contents on page
const imagePresenter = (images, header ="This is a Random Dog Search") => {
   if(images.length !== 0) {
        searchHeader.innerHTML= header
        let div = ''
        images.forEach(image => div+=`<div class="column"><img src="${image}"></div>`)
        randomDisplay.innerHTML= div
   }else {
        randomDisplay.innerHTML=`<div class="dogs">No Result Found</div>` 
   } 
}
const dogInfoPresenter = (info) => {
   try {
    if(JSON.stringify(info) !== JSON.stringify({})) {
        dogImage.innerHTML = `<img src="${info.image.url}">`
        let descList =''
        info.name ? descList += `<li><span>Name</span>: ${info.name}</li>`: descList +=''
        info.origin ? descList += `<li><span>Origin</span>: ${info.origin}</li>`: descList +=''
        info.bred_for ? descList += `<li><span>Bred For</span>: ${info.bred_for}</li>`: descList +=''
        info.life_span ? descList += `<li><span>Life Span</span>: ${info.life_span}</li>`: descList +=''
        info.temperament ? descList += `<li><span>Temperament</span>: ${info.temperament}</li>`: descList +=''
        info.description ? descList += `<li><span>Description</span>: ${info.description}</li>`: descList+=''
        desc.innerHTML = descList
    }else {
        dogImage.innerHTML = `<img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/1255/image-not-found.svg">`
    }
   } catch (error) {
       console.log(error)
   }
}


//Responding to user events
select.addEventListener('change', async (e) => {
    let val = e.target.value;
    let dogs = dataStore()
    let result = findDog(val, dogs)
    let randomBreedImages = await getDogImages(val)
    if(randomBreedImages !== undefined) {
        pageIsLoading = false
        imagePresenter(randomBreedImages.message, header = `Your Search for ${val}`)
    }else {
       result = result.map((res) => res.image.url)
       pageIsLoading = false
        imagePresenter(result, header = `Your Search for ${val}`)
    }
    if(result.length > 0) {
        dogInfoPresenter(result[Math.floor(Math.random() * result.length)])
    }else if(randomBreedImages !== undefined) {
        dogInfoPresenter(
            {
                image: {url: randomBreedImages.message[0]},
                name: val,
                description: `Oops! It seems we do not have enough Information about this breed`

        })
    }
})

searchBox.addEventListener('keyup', async(e) => {
    autoSuggestBox.classList.add('open')
    let val = e.target.value
    console.log(val)
    let dogs = dataStore()
    autoSuggest(val, dogs)
    let result = findDog(val, dogs)
    let randomBreedImages = await getDogImages(val)
    if(val.length == 0) {
        autoSuggestBox.innerHTML = ''
        imagePresenter(randomBreedImages.message)
    }
    if(!randomBreedImages) {
        imagePresenter(randomBreedImages.message, header = `Your Search for ${val}`)
        console.log(result[0])
        dogInfoPresenter(result[0])
    }else {
       result = result.map((res) => res.image.url)
        imagePresenter(result, header = `Your Search for ${val}`)
        dogInfoPresenter(result[Math.floor(Math.random() * result.length)])
    }
    if(result.length > 0) {
        dogInfoPresenter(result[Math.floor(Math.random() * result.length)])
    }else if(randomBreedImages !== undefined) {
        dogInfoPresenter(
            {
                image: {url: randomBreedImages.message[0]},
                name: val,
                description: `Oops! It seems we do not have enough Information about this breed`

        })
    }
  
})

const autoSuggest = (name, dogs) => {
    let search = findDog(name, dogs)
    if(search.length !== 0) {
        let list =''
        search.forEach(item => list += `<li>${item.name}</li>`)
        autoSuggestBox.innerHTML = list
       // dogInfoPresenter(search[Math.floor(Math.random() * search.length)])
    }
}

if(!isSearchAvailable) {
    getRandomImages().then(data => {
        imagePresenter(data.message)
        dogInfoPresenter({})
    })
    
}

//Event delegation for our auto suggest li items
autoSuggestBox.addEventListener('click', async (e) => {
    autoSuggestBox.classList.remove('open')
    searchBox.value = e.target.textContent
    let val = e.target.textContent
    autoSuggestBox.innerHTML = ''
    let dogs = dataStore()
    let result = findDog(val, dogs)
    let randomBreedImages = await getDogImages(val)
    if(randomBreedImages !== undefined) {
        if(result.length !== 1) {
            imagePresenter(randomBreedImages.message, header = `Your Search for ${val}`)
            dogInfoPresenter(result[Math.floor(Math.random() * result.length)])
        }else {
            imagePresenter([result.image.url], header = `Your Search for ${val}`)
            dogInfoPresenter(result[0])
        }
 
    }else {
       result = result.map((res) => res.image.url)
        imagePresenter(result, header = `Your Search for ${val}`)
        dogInfoPresenter(result[Math.floor(Math.random() * result.length)])
    }
    if(result.length > 0) {
        dogInfoPresenter(result[0])
    }else if(randomBreedImages !== undefined) {
        dogInfoPresenter(
            {
                image: {url: randomBreedImages.message[0]},
                name: val,
                description: `Oops! It seems we do not have enough Information about this breed`

        })
    }

})

// Event listener for search button
searchBtn.addEventListener('click', async (e) => {
    let val = searchBox.value
    e.preventDefault()
    let dogs = dataStore()
    let result = findDog(val, dogs)
    let randomBreedImages = await getDogImages(val)
    if(randomBreedImages !== undefined) {
        imagePresenter(randomBreedImages.message, header = `Your Search for ${val}`)
    }else {
       result = result.map((res) => res.image.url)
        imagePresenter(result, header = `Your Search for ${val}`)
    }
    if(result.length > 0) {
        dogInfoPresenter(result[Math.floor(Math.random() * result.length)])
    }else if(randomBreedImages !== undefined) {
        dogInfoPresenter(
            {
                image: {url: randomBreedImages.message[0]},
                name: val,
                description: `Oops! It seems we do not have enough Information about this breed`

        })
    }
})

if(pageIsLoading) {
    isLoading()
}else {
    isLoaded()
}