import React from 'react'

import { KashiPair } from '../../.graphclient'
import { AssetCell } from './AssetCell'
import { AvailableForBorrowCell } from './AvailableForBorrowCell'
import { BorrowAPRCell } from './BorrowAPRCell'
import { BorrowAssetCell, BorrowAssetCellPopover } from './BorrowAssetCell'
import { CollateralCell } from './CollateralCell'
import { LendAssetCell, LendAssetCellPopover } from './LendAssetCell'
import { NetworkCell } from './NetworkCell'
import { SupplyAPRCell } from './SupplyAPRCell'
import { TotalAPRCell } from './TotalAPRCell'
import { TotalAssetCell } from './TotalAssetCell'
import { TotalBorrowCell } from './TotalBorrowCell'
import { ExtendedColumnDef } from './types'

export const ICON_SIZE = 20
export const PAGE_SIZE = 20

export const NETWORK_COLUMN: ExtendedColumnDef<KashiPair, unknown> = {
  id: 'network',
  header: 'Network',
  cell: (props) => <NetworkCell row={props.row.original} />,
  size: 20,
  skeleton: <div className="rounded-full bg-slate-700 w-[26px] h-[26px] animate-pulse" />,
}

export const ASSET_COLUMN: ExtendedColumnDef<KashiPair, unknown> = {
  id: 'asset',
  header: 'Lend Asset',
  cell: (props) => <AssetCell row={props.row.original} />,
  size: 50,
  skeleton: <div className="rounded-full bg-slate-700 w-full h-[20px] animate-pulse" />,
}

export const LEND_ASSET_COLUMN: ExtendedColumnDef<KashiPair, unknown> = {
  id: 'asset',
  header: 'Lend Asset',
  cell: (props) => <LendAssetCell row={props.row.original} />,
  size: 70,
  skeleton: (
    <div className="flex items-center flex-grow">
      <div className="flex items-baseline min-w-[54px] min-h-[40px]">
        <div className="z-[1] w-[32px] h-[32px] rounded-full animate-pulse bg-slate-700" />
        <div className="-ml-2.5 w-[20px] h-[20px] rounded-full animate-pulse bg-slate-700" />
      </div>
      <div className="flex rounded-full bg-slate-700 w-full h-[20px] animate-pulse" />
    </div>
  ),
}

export const LEND_ASSET_COLUMN_POPOVER: ExtendedColumnDef<KashiPair, unknown> = {
  id: 'asset',
  header: 'Market',
  cell: (props) => <LendAssetCellPopover row={props.row.original} />,
  size: 70,
  skeleton: <div className="rounded-full bg-slate-700 w-full h-[20px] animate-pulse" />,
}

export const BORROW_ASSET_COLUMN: ExtendedColumnDef<KashiPair, unknown> = {
  id: 'collateral',
  header: 'Borrow Asset',
  cell: (props) => <BorrowAssetCell row={props.row.original} />,
  size: 70,
  skeleton: (
    <div className="flex items-center flex-grow">
      <div className="flex items-baseline min-w-[54px] min-h-[40px]">
        <div className="z-[1] w-[32px] h-[32px] rounded-full animate-pulse bg-slate-700" />
        <div className="-ml-2.5 w-[20px] h-[20px] rounded-full animate-pulse bg-slate-700" />
      </div>
      <div className="flex rounded-full bg-slate-700 w-full h-[20px] animate-pulse" />
    </div>
  ),
}

export const BORROW_ASSET_COLUMN_POPOVER: ExtendedColumnDef<KashiPair, unknown> = {
  id: 'collateral',
  header: 'Market',
  cell: (props) => <BorrowAssetCellPopover row={props.row.original} />,
  size: 70,
  skeleton: <div className="rounded-full bg-slate-700 w-full h-[20px] animate-pulse" />,
}

export const COLLATERAL_COLUMN: ExtendedColumnDef<KashiPair, unknown> = {
  id: 'collateral',
  header: 'Borrow Asset',
  cell: (props) => <CollateralCell row={props.row.original} />,
  size: 50,
  skeleton: <div className="rounded-full bg-slate-700 w-full h-[20px] animate-pulse" />,
}

export const TOTAL_ASSET_COLUMN: ExtendedColumnDef<KashiPair, unknown> = {
  id: 'totalAsset',
  header: 'Total Supply',
  accessorFn: (row) => row.totalAsset,
  cell: (props) => <TotalAssetCell row={props.row.original} />,
  size: 60,
  skeleton: <div className="rounded-full bg-slate-700 w-full h-[20px] animate-pulse" />,
}

export const TOTAL_APR_COLUMN: ExtendedColumnDef<KashiPair, unknown> = {
  id: 'totalAPR',
  header: 'Total APR',
  accessorFn: (row) => row.supplyAPR,
  cell: (props) => <TotalAPRCell row={props.row.original} />,
  size: 40,
  skeleton: <div className="rounded-full bg-slate-700 w-full h-[20px] animate-pulse" />,
}

export const SUPPLY_APR_COLUMN: ExtendedColumnDef<KashiPair, unknown> = {
  id: 'supply',
  header: 'Lend APY',
  accessorFn: (row) => row.supplyAPR,
  cell: (props) => <SupplyAPRCell row={props.row.original} />,
  size: 40,
  skeleton: <div className="rounded-full bg-slate-700 w-full h-[20px] animate-pulse" />,
}

export const TOTAL_BORROW_COLUMN: ExtendedColumnDef<KashiPair, unknown> = {
  id: 'totalBorrow',
  header: 'Borrowed',
  cell: (props) => <TotalBorrowCell row={props.row.original} />,
  size: 40,
  skeleton: <div className="rounded-full bg-slate-700 w-full h-[20px] animate-pulse" />,
}

export const AVAILABLE_FOR_BORROW_COLUMN: ExtendedColumnDef<KashiPair, unknown> = {
  id: 'availableBorrow',
  header: 'Available For Borrow',
  cell: (props) => <AvailableForBorrowCell row={props.row.original} />,
  size: 40,
  skeleton: <div className="rounded-full bg-slate-700 w-full h-[20px] animate-pulse" />,
}

export const BORROW_APR_COLUMN: ExtendedColumnDef<KashiPair, unknown> = {
  id: 'borrow',
  header: 'Borrow APR',
  accessorFn: (row) => row.borrowAPR,
  cell: (props) => <BorrowAPRCell row={props.row.original} />,
  size: 40,
  skeleton: <div className="rounded-full bg-slate-700 w-full h-[20px] animate-pulse" />,
}

export const REWARD_APR_COLUMN: ExtendedColumnDef<KashiPair, unknown> = {
  id: 'reward',
  header: 'Reward APY',
  accessorFn: (row) => row.borrowAPR,
  cell: (props) => <BorrowAPRCell row={props.row.original} />,
  size: 40,
  skeleton: <div className="rounded-full bg-slate-700 w-full h-[20px] animate-pulse" />,
}
