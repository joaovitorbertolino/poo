class Personagem{
    constructor(
        public nome: string,
        private vida: number
    ) {}

    ataque (dano : number){
        this.vida -= dano

        if(this.vida <= 0){
            this.vida = 0
        }
        console.log(`${this.nome} recebeu ${dano} de dano! PV restante ${this.vida}`)
    }
    showVida(){
        return this.vida
    }
}

const heroi = new Personagem('Aragorn', 100)

console.log(`Personagem criado ${heroi.nome} com ${heroi.showVida()} PV`)

heroi.ataque(30)
heroi.ataque(80)