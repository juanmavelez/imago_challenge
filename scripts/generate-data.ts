import * as fs from 'fs';
import * as path from 'path';

const photographers = ["John Doe", "Jane Smith", "Ansel Adams", "Imogen Cunningham", "Henri Cartier-Bresson"];
const subjects = [
    "A beautiful scenery [nature] [sunset]",
    "Sunset over the mountains [nature] [beautiful]",
    "City skyline at night [city] [night]",
    "A small puppy playing in the grass [dog] [cute]",
    "Michael jackson performing on stage [music] [live]",
    "Michael jackson dog [music] [dog]",
    "Michael jackson house [music] [house]",
    "Car driving on a highway [auto] [speed]",
    "Speeding auto on the race track [auto] [race]",
    "Vintage auto parked on the street [auto] [vintage]",
    "Football player scoring a goal [sports] [football]",
    "Basketball player dunking [sports] [basketball]",
    "President giving a speech [politics] [speech]",
    "Protestors on the street [politics] [protest]",
    "Scientist in a lab [science] [lab]",
    "Space shuttle launching [science] [space]",
];

const generateDate = () => {
    const start = new Date(2000, 0, 1).getTime();
    const end = new Date().getTime();
    const date = new Date(start + Math.random() * (end - start));
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
};

const items = [];
for (let i = 1; i <= 10000; i++) {
    items.push({
        suchtext: subjects[Math.floor(Math.random() * subjects.length)],
        bildnummer: `IMG_${i.toString().padStart(6, '0')}`,
        fotografen: photographers[Math.floor(Math.random() * photographers.length)],
        datum: generateDate(),
        hoehe: String(Math.floor(Math.random() * 2000) + 500),
        breite: String(Math.floor(Math.random() * 3000) + 500),
    });
}

const dirPath = path.join(__dirname, '../data');
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
}

fs.writeFileSync(path.join(dirPath, 'data.json'), JSON.stringify(items, null, 2));
console.log('Successfully generated 10,000 items in data/data.json');
