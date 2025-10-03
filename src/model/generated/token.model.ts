import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, IntColumn as IntColumn_, BigIntColumn as BigIntColumn_, OneToMany as OneToMany_} from "@subsquid/typeorm-store"
import {Transfer} from "./transfer.model"

@Entity_()
export class Token {
    constructor(props?: Partial<Token>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_({unique: true})
    @StringColumn_({nullable: false})
    address!: string

    @StringColumn_({nullable: true})
    symbol!: string | undefined | null

    @StringColumn_({nullable: true})
    name!: string | undefined | null

    @IntColumn_({nullable: true})
    decimals!: number | undefined | null

    @BigIntColumn_({nullable: true})
    totalSupply!: bigint | undefined | null

    @OneToMany_(() => Transfer, e => e.token)
    transfers!: Transfer[]
}
