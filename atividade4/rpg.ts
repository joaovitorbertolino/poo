interface AtualizavelPorTurno {
  novoTurno(): void;
}

interface Arma extends AtualizavelPorTurno {
  readonly nome: string;
  atacar(): number | null;
}

interface Efeito extends AtualizavelPorTurno {
  readonly nome: string;
  terminou(): boolean;
}

interface Habilidade extends AtualizavelPorTurno {
  readonly nome: string;
  usar(usuario: Personagem, alvo: Personagem): void;
}


// =====================================
// COOLDOWN
// =====================================

class Cooldown implements AtualizavelPorTurno {
  private turnosRestantes = 0;

  constructor(private readonly duracao: number) {}

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


// =====================================
// ARMAS
// =====================================

class Espada implements Arma {
  private cooldown = new Cooldown(1);

  constructor(
    public readonly nome: string,
    private readonly dano: number
  ) {}

  atacar(): number | null {
    if (!this.cooldown.disponivel()) {
      console.log(`${this.nome} está em cooldown.`);
      return null;
    }

    this.cooldown.iniciar();

    return this.dano;
  }

  novoTurno(): void {
    this.cooldown.novoTurno();
  }
}


class Arco implements Arma {
  private cooldown = new Cooldown(2);

  constructor(
    public readonly nome: string,
    private readonly dano: number,
    private flechas: number
  ) {}

  atacar(): number | null {
    if (!this.cooldown.disponivel()) {
      console.log(`${this.nome} está em cooldown.`);
      return null;
    }

    if (this.flechas === 0) {
      console.log(`${this.nome}: não há flechas.`);
      return null;
    }

    this.flechas--;

    this.cooldown.iniciar();

    return this.dano;
  }

  novoTurno(): void {
    this.cooldown.novoTurno();
  }
}


class VarinhaMagica implements Arma {
  private cooldown = new Cooldown(2);

  constructor(
    public readonly nome: string,
    private readonly dano: number
  ) {}

  atacar(): number | null {
    if (!this.cooldown.disponivel()) {
      console.log(`${this.nome} está em cooldown.`);
      return null;
    }

    this.cooldown.iniciar();

    return this.dano;
  }

  novoTurno(): void {
    this.cooldown.novoTurno();
  }
}


// =====================================
// HABILIDADES
// =====================================

class BolaDeFogo implements Habilidade {
  readonly nome = "Bola de Fogo";

  private cooldown = new Cooldown(2);

  usar(
    usuario: Personagem,
    alvo: Personagem
  ): void {
    if (!this.cooldown.disponivel()) {
      console.log(
        "Bola de Fogo está em cooldown."
      );
      return;
    }

    if (!usuario.gastarMana(20)) {
      return;
    }

    alvo.receberDano(40);

    console.log(
      `${usuario.nome} usou Bola de Fogo em ` +
      `${alvo.nome} e causou 40 de dano.`
    );

    this.cooldown.iniciar();
  }

  novoTurno(): void {
    this.cooldown.novoTurno();
  }
}


class Cura implements Habilidade {
  readonly nome = "Cura";

  private cooldown = new Cooldown(1);

  usar(
    usuario: Personagem,
    alvo: Personagem
  ): void {
    if (!this.cooldown.disponivel()) {
      console.log(
        "Cura está em cooldown."
      );
      return;
    }

    if (!usuario.gastarMana(15)) {
      return;
    }

    alvo.curar(30);

    console.log(
      `${usuario.nome} usou Cura em ` +
      `${alvo.nome} e recuperou 30 de vida.`
    );

    this.cooldown.iniciar();
  }

  novoTurno(): void {
    this.cooldown.novoTurno();
  }
}


class GolpePoderoso implements Habilidade {
  readonly nome = "Golpe Poderoso";

  private cooldown = new Cooldown(3);

  usar(
    usuario: Personagem,
    alvo: Personagem
  ): void {
    if (!this.cooldown.disponivel()) {
      console.log(
        "Golpe Poderoso está em cooldown."
      );
      return;
    }

    alvo.receberDano(60);

    console.log(
      `${usuario.nome} usou Golpe Poderoso em ` +
      `${alvo.nome} e causou 60 de dano.`
    );

    this.cooldown.iniciar();
  }

  novoTurno(): void {
    this.cooldown.novoTurno();
  }
}


class Explosao implements Habilidade {
  readonly nome = "Explosão";

  private cooldown = new Cooldown(3);

  usar(
    usuario: Personagem,
    alvo: Personagem
  ): void {
    if (!this.cooldown.disponivel()) {
      console.log(
        "Explosão está em cooldown."
      );
      return;
    }

    if (!usuario.gastarMana(25)) {
      return;
    }

    alvo.receberDano(20);

    console.log(
      `${usuario.nome} usou Explosão em ` +
      `${alvo.nome} e causou 20 de dano.`
    );

    this.cooldown.iniciar();
  }

  novoTurno(): void {
    this.cooldown.novoTurno();
  }
}


class DrenoVital implements Habilidade {
  readonly nome = "Dreno Vital";

  private cooldown = new Cooldown(2);

  usar(
    usuario: Personagem,
    alvo: Personagem
  ): void {
    if (!this.cooldown.disponivel()) {
      console.log(
        "Dreno Vital está em cooldown."
      );
      return;
    }

    if (!usuario.gastarMana(10)) {
      return;
    }

    alvo.receberDano(20);
    usuario.curar(20);

    console.log(
      `${usuario.nome} usou Dreno Vital em ` +
      `${alvo.nome} e causou 20 de dano.`
    );

    this.cooldown.iniciar();
  }

  novoTurno(): void {
    this.cooldown.novoTurno();
  }
}


// =====================================
// ITEM
// =====================================

class Item {
  constructor(
    public readonly nome: string,
    public readonly valor: number
  ) {}
}


class Inventario {
  private readonly itens: Item[] = [];

  adicionar(item: Item): void {
    this.itens.push(item);
  }

  remover(item: Item): boolean {
    const indice = this.itens.indexOf(item);

    if (indice === -1) {
      return false;
    }

    this.itens.splice(indice, 1);

    return true;
  }

  listar(): readonly Item[] {
    return [...this.itens];
  }
}

class Veneno implements Efeito {
  private turnosRestantes: number;

  constructor(
    public readonly nome: string,
    private readonly personagem: Personagem,
    private readonly danoPorTurno: number,
    duracao: number
  ) {
    this.turnosRestantes = duracao;
  }

  novoTurno(): void {
    if (this.terminou()) {
      return;
    }

    this.personagem.receberDano(
      this.danoPorTurno
    );

    this.turnosRestantes--;
  }

  terminou(): boolean {
    return this.turnosRestantes === 0;
  }
}


class Regeneracao implements Efeito {
  private turnosRestantes: number;

  constructor(
    public readonly nome: string,
    private readonly personagem: Personagem,
    private readonly curaPorTurno: number,
    duracao: number
  ) {
    this.turnosRestantes = duracao;
  }

  novoTurno(): void {
    if (this.terminou()) {
      return;
    }

    this.personagem.curar(
      this.curaPorTurno
    );

    this.turnosRestantes--;
  }

  terminou(): boolean {
    return this.turnosRestantes === 0;
  }
}


class Personagem implements AtualizavelPorTurno {
  private vida: number;
  private mana: number;

  private nivel = 1;
  private experiencia = 0;

  private readonly inventario: Inventario;

  private readonly efeitos: Efeito[] = [];

  private readonly habilidades: Habilidade[] = [];

  private readonly atualizaveis:
    AtualizavelPorTurno[] = [];

  constructor(
    public readonly nome: string,
    private vidaMaxima: number,
    private readonly arma: Arma,
    private readonly manaMaxima: number
  ) {
    this.vida = vidaMaxima;
    this.mana = manaMaxima;

    this.inventario = new Inventario();

    this.registrarAtualizavel(arma);
  }


  atacar(inimigo: Personagem): void {
    const dano = this.arma.atacar();

    if (dano == null) {
      return;
    }

    inimigo.receberDano(dano);

    console.log(
      `${this.nome} atacou ${inimigo.nome} ` +
      `com ${this.arma.nome} e causou ${dano} de dano.`
    );

    this.ganharExperiencia(10);
  }


  adicionarHabilidade(
    habilidade: Habilidade
  ): void {
    this.habilidades.push(habilidade);

    this.registrarAtualizavel(
      habilidade
    );
  }


  usarHabilidade(
    habilidade: Habilidade,
    alvo: Personagem
  ): void {
    habilidade.usar(this, alvo);
  }


  gastarMana(
    quantidade: number
  ): boolean {
    if (this.mana < quantidade) {
      console.log(
        `${this.nome}: mana insuficiente.`
      );

      return false;
    }

    this.mana -= quantidade;

    console.log(
      `${this.nome}: mana ` +
      `${this.mana}/${this.manaMaxima}.`
    );

    return true;
  }


  receberDano(
    dano: number
  ): void {
    this.vida = Math.max(
      0,
      this.vida - dano
    );

    console.log(
      `${this.nome} recebeu ${dano} de dano. ` +
      `Vida: ${this.vida}/${this.vidaMaxima}`
    );

    if (!this.estaVivo()) {
      console.log(
        `${this.nome} foi derrotado!`
      );
    }
  }


  curar(
    quantidade: number
  ): void {
    const vidaAntes = this.vida;

    this.vida = Math.min(
      this.vida + quantidade,
      this.vidaMaxima
    );

    const recuperado =
      this.vida - vidaAntes;

    console.log(
      `${this.nome} recuperou ${recuperado} de vida. ` +
      `Vida: ${this.vida}/${this.vidaMaxima}`
    );
  }


  estaVivo(): boolean {
    return this.vida > 0;
  }


  ganharExperiencia(
    quantidade: number
  ): void {
    this.experiencia += quantidade;
  }


  adicionarItem(
    item: Item
  ): void {
    this.inventario.adicionar(item);
  }


  removerItem(
    item: Item
  ): void {
    this.inventario.remover(item);
  }


  mostrarInventario(): void {
    console.log(
      `Inventario de ${this.nome}`
    );

    for (
      const item of this.inventario.listar()
    ) {
      console.log(
        `- ${item.nome} (${item.valor})`
      );
    }
  }


  adicionarEfeito(
    efeito: Efeito
  ): void {
    this.efeitos.push(efeito);

    this.registrarAtualizavel(
      efeito
    );
  }


  private registrarAtualizavel(
    objeto: AtualizavelPorTurno
  ): void {
    this.atualizaveis.push(objeto);
  }


  novoTurno(): void {
    for (
      const objeto of this.atualizaveis
    ) {
      objeto.novoTurno();
    }
  }
}


// =====================================
// JOGO
// =====================================

class Jogo {
  private readonly personagens:
    Personagem[] = [];

  private turno = 0;

  adicionarPersonagem(
    personagem: Personagem
  ): void {
    this.personagens.push(
      personagem
    );
  }

  novoTurno(): void {
    this.turno++;

    console.log(
      `\n===== TURNO ${this.turno} =====`
    );

    for (
      const personagem of this.personagens
    ) {
      personagem.novoTurno();
    }
  }
}

const jogo = new Jogo();


const espada = new Espada(
  "Espada longa",
  25
);

const arco = new Arco(
  "Arco Élfico",
  20,
  3
);

const varinha = new VarinhaMagica(
  "Varinha de fogo",
  30
);


const guerreiro = new Personagem(
  "Guerreiro",
  150,
  espada,
  50
);

const arqueiro = new Personagem(
  "Arqueiro",
  100,
  arco,
  40
);

const mago = new Personagem(
  "Mago",
  80,
  varinha,
  100
);


jogo.adicionarPersonagem(
  guerreiro
);

jogo.adicionarPersonagem(
  arqueiro
);

jogo.adicionarPersonagem(
  mago
);


const bolaDeFogo =
  new BolaDeFogo();

const cura =
  new Cura();

const golpePoderoso =
  new GolpePoderoso();

const explosao =
  new Explosao();

const drenoVital =
  new DrenoVital();


mago.adicionarHabilidade(
  bolaDeFogo
);

mago.adicionarHabilidade(
  cura
);

mago.adicionarHabilidade(
  explosao
);

guerreiro.adicionarHabilidade(
  golpePoderoso
);

guerreiro.adicionarHabilidade(
  drenoVital
);



mago.usarHabilidade(
  bolaDeFogo,
  guerreiro
);

guerreiro.usarHabilidade(
  golpePoderoso,
  arqueiro
);

mago.usarHabilidade(
  cura,
  mago
);

mago.usarHabilidade(
  explosao,
  guerreiro
);

guerreiro.usarHabilidade(
  drenoVital,
  arqueiro
);

jogo.novoTurno();
jogo.novoTurno();
jogo.novoTurno();
