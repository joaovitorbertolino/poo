function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

interface AtualizavelPorTurno {
    novoTurno(): void;
}

interface Arma extends AtualizavelPorTurno {
    nome: string;
    atacar(): number;
}

class CoolDown {

    private turnosRestantes = 0;

    constructor(private duracao: number) {}

    disponivel(): boolean {
        return this.turnosRestantes === 0;
    }

    iniciar(): void {
        this.turnosRestantes = this.duracao;
    }

    novoTurno(): void {
        if (this.turnosRestantes > 0) {
            this.turnosRestantes--;
        }
    }
}

class Espada implements Arma {

    private cooldown = new CoolDown(1);

    constructor(
        public nome: string,
        private dano: number
    ) {}

    atacar(): number {

        if (!this.cooldown.disponivel()) {
            console.log("A espada está em cooldown!");
            return 0;
        }

        this.cooldown.iniciar();

        return this.dano;
    }

    novoTurno(): void {
        this.cooldown.novoTurno();
    }
}

class Arco implements Arma {

    private cooldown = new CoolDown(2);

    constructor(
        public nome: string,
        private dano: number,
        private flechas: number
    ) {}

    atacar(): number {

        if (!this.cooldown.disponivel()) {
            console.log("O arco está em cooldown!");
            return 0;
        }

        if (this.flechas <= 0) {
            console.log("Sem flechas!");
            return 0;
        }

        this.flechas--;

        this.cooldown.iniciar();

        console.log(`Flechas restantes: ${this.flechas}`);

        return this.dano;
    }

    novoTurno(): void {
        this.cooldown.novoTurno();
    }

    recarregar(): void {
        this.flechas = 10;
        console.log("Arco recarregado!");
    }
}

class Cajado implements Arma {

    private cooldown = new CoolDown(3);

    constructor(
        public nome: string,
        private dano: number,
        private mana: number
    ) {}

    atacar(): number {

        if (!this.cooldown.disponivel()) {
            console.log("O cajado está em cooldown!");
            return 0;
        }

        if (this.mana < 5) {
            console.log("Mana insuficiente!");
            return 0;
        }

        this.mana -= 5;

        this.cooldown.iniciar();

        console.log(`Mana restante: ${this.mana}`);

        return this.dano;
    }

    novoTurno(): void {

        this.cooldown.novoTurno();

        if (this.mana < 20) {
            this.mana++;
        }
    }
}

class Item {

    constructor(
        public nome: string,
        public valor: number
    ) {}
}

class Inventario {

    private itens: Item[] = [];

    adicionar(item: Item): void {
        this.itens.push(item);
    }

    listar(): void {

        if (this.itens.length === 0) {
            console.log("Inventário vazio.");
            return;
        }

        console.log("\nInventário:");

        for (const item of this.itens) {
            console.log(`${item.nome} - ${item.valor}`);
        }
    }
}

class Personagem implements AtualizavelPorTurno {

    private inventario: Inventario;

    constructor(
        public nome: string,
        private vida: number,
        private vidaMaxima: number,
        private nivel: number,
        private exp: number,
        private arma: Arma
    ) {
        this.inventario = new Inventario();
    }

    atacar(alvo: Personagem): void {

        const dano = this.arma.atacar();

        if (dano === 0) {
            return;
        }

        console.log(
            `${this.nome} atacou ${alvo.nome} causando ${dano} de dano!`
        );

        alvo.receberDano(dano);
    }

    receberDano(dano: number): void {

        this.vida -= dano;

        if (this.vida < 0) {
            this.vida = 0;
        }

        console.log(
            `${this.nome}: ${this.vida}/${this.vidaMaxima} PV`
        );
    }

    curar(valor: number): void {

        this.vida += valor;

        if (this.vida > this.vidaMaxima) {
            this.vida = this.vidaMaxima;
        }
    }

    ganharExp(valor: number): void {

        this.exp += valor;

        if (this.exp >= 100) {

            this.exp = 0;
            this.nivel++;

            this.vidaMaxima += 20;
            this.vida = this.vidaMaxima;

            console.log(
                `${this.nome} subiu para o nível ${this.nivel}!`
            );
        }
    }

    adicionarItem(item: Item): void {
        this.inventario.adicionar(item);
    }

    mostrarInventario(): void {
        this.inventario.listar();
    }

    estaVivo(): boolean {
        return this.vida > 0;
    }

    novoTurno(): void {
        this.arma.novoTurno();
    }

    mostrarStatus(): void {

        console.log("\n=================");
        console.log(`Nome: ${this.nome}`);
        console.log(`Vida: ${this.vida}/${this.vidaMaxima}`);
        console.log(`Nível: ${this.nivel}`);
        console.log(`XP: ${this.exp}`);
        console.log(`Arma: ${this.arma.nome}`);
        console.log("=================");
    }
}

class Jogo {

    private personagens: Personagem[] = [];
    private atualizaveis: AtualizavelPorTurno[] = [];
    private turno = 0;

    adicionarPersonagem(personagem: Personagem): void {

        this.personagens.push(personagem);
        this.atualizaveis.push(personagem);
    }

    novoTurno(): void {

        this.turno++;

        console.log(`\n===== TURNO ${this.turno} =====`);

        for (const objeto of this.atualizaveis) {
            objeto.novoTurno();
        }
    }

    criarPersonagem(): void {

        let nome: string | null;

        do {
            nome = prompt("Nome do personagem: ");
        } while (
            nome === null ||
            nome.trim() === ""
        );

        let arma: Arma;
        let classe: string | null;

        do {

            console.log("\n1 - Guerreiro");
            console.log("2 - Arqueiro");
            console.log("3 - Mago");

            classe = prompt("Escolha: ");

            if (classe === "1") {

                arma = new Espada(
                    "Espada",
                    20
                );

            } else if (classe === "2") {

                arma = new Arco(
                    "Arco",
                    15,
                    10
                );

            } else if (classe === "3") {

                arma = new Cajado(
                    "Cajado",
                    25,
                    20
                );

            } else {

                console.log("Opção inválida!");
            }

        } while (
            classe !== "1" &&
            classe !== "2" &&
            classe !== "3"
        );

        const personagem = new Personagem(
            nome,
            100,
            100,
            1,
            0,
            arma
        );

        this.adicionarPersonagem(personagem);

        console.log("\nPersonagem criado!");

        personagem.mostrarStatus();
    }

    async iniciarJogo(): Promise<void> {

        this.criarPersonagem();

        const jogador = this.personagens[0];

        const goblin = new Personagem(
            "Goblin",
            100,
            100,
            1,
            0,
            new Espada(
                "Espada do Goblin",
                10
            )
        );

        this.adicionarPersonagem(goblin);

        while (
            jogador.estaVivo() &&
            goblin.estaVivo()
        ) {

            console.log("\n1 - Atacar");
            console.log("2 - Inventário");
            console.log("3 - Passar turno");

            const opcao = prompt("Escolha: ");

            if (opcao === "1") {

                jogador.atacar(goblin);

                if (goblin.estaVivo()) {
                    goblin.atacar(jogador);
                }

                this.novoTurno();

            } else if (opcao === "2") {

                jogador.mostrarInventario();

            } else if (opcao === "3") {

                this.novoTurno();

                if (goblin.estaVivo()) {
                    goblin.atacar(jogador);
                }
            }

            await sleep(1000);
        }

        if (jogador.estaVivo()) {

            console.log("\nVocê venceu!");

            jogador.ganharExp(100);

        } else {

            console.log("\nVocê perdeu!");
        }
    }
}

const jogo = new Jogo();

jogo.iniciarJogo();