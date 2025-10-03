import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, IntColumn as IntColumn_, Index as Index_, StringColumn as StringColumn_, DateTimeColumn as DateTimeColumn_, BigIntColumn as BigIntColumn_, OneToMany as OneToMany_} from "@subsquid/typeorm-store"
import {Transaction} from "./transaction.model"

@Entity_()
export class Block {
    constructor(props?: Partial<Block>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @IntColumn_({nullable: false})
    number!: number

    @Index_()
    @StringColumn_({nullable: false})
    hash!: string

    @Index_()
    @DateTimeColumn_({nullable: false})
    timestamp!: Date

    @StringColumn_({nullable: false})
    parentHash!: string

    @BigIntColumn_({nullable: false})
    gasUsed!: bigint

    @BigIntColumn_({nullable: false})
    gasLimit!: bigint

    @BigIntColumn_({nullable: true})
    baseFeePerGas!: bigint | undefined | null

    @IntColumn_({nullable: false})
    transactionCount!: number

    @OneToMany_(() => Transaction, e => e.block)
    transactions!: Transaction[]
}
