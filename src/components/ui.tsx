import * as Dialog from '@radix-ui/react-dialog';
import {X} from 'lucide-react';
import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';
import type {ButtonHTMLAttributes,ReactNode} from 'react';
export const cn=(...values:ClassValue[])=>twMerge(clsx(values));
export function Button({className,...props}:ButtonHTMLAttributes<HTMLButtonElement>){return <button className={cn('button',className)} {...props}/>;}
export function Modal({open,onClose,title,children}:{open:boolean;onClose:()=>void;title:string;children:ReactNode}){return <Dialog.Root open={open} onOpenChange={v=>!v&&onClose()}><Dialog.Portal><Dialog.Overlay className="overlay"/><Dialog.Content className="modal"><div className="modal-head"><Dialog.Title>{title}</Dialog.Title><Dialog.Close asChild><button className="icon-button" aria-label="Close dialog"><X size={20}/></button></Dialog.Close></div><Dialog.Description className="sr-only">Manage your business records. All amounts are in Indian Rupees.</Dialog.Description>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>;}
