/*
 *  @license
 *  Copyright Hôpitaux Universitaires de Genève. All Rights Reserved.
 *
 *  Use of this source code is governed by an Apache-2.0 license that can be
 *  found in the LICENSE file at https://github.com/DSI-HUG/dejajs-components/blob/master/LICENSE
 */

import { BehaviorSubject, concat as observableConcat, from as observableFrom, iif as observableIif, Observable, of as observableOf, Subscriber } from 'rxjs';
import { filter, map, reduce, switchMap, tap } from 'rxjs/operators';
import { Diacritics } from '../diacritics/diacritics';
import { IGroupInfo } from '../grouping/group-infos';
import { GroupingService } from '../grouping/grouping.service';
import { ISortInfos } from '../sorting/sort-infos.model';
import { SortingService } from '../sorting/sorting.service';
import { IItemBase } from './item-base';
import { IItemTree } from './item-tree';

/** Service de gestion des listes (deja-treelist, deja-select et deja-grid).
 * Ce service permet la gestion du viewport et la gestion des caches des listes.
 * Il peut-être surchargé pour faire du lazy loading ou du paging.
 */
export class ItemListService {
    public static defaultChildrenField = 'items';
    public static defaultTextField = 'displayName';
    public static defaultValueField = 'value';

    // Waiter
    private _waiter$ = new BehaviorSubject<boolean>(false);

    // Working item array (can be recursive)
    private _items: IItemBase[];

    // Cache for lists (flat lists only, not recursive)
    private _cache = {} as {
        rowsCount?: number;
        depthMax?: number;
        groupedList?: IItemTree[];
        flatList?: IItemBase[];
        visibleList?: IItemBase[];
    };

    // Selected items cache
    private selectedList: IItemBase[];
    private _hideSelected: boolean;

    // Cache for last query. Flat list will be regenerated only if the query change
    private _lastQuery: RegExp | string;
    private internalQuery: RegExp;

    // Sorting
    private _sortingService: SortingService;

    // grouping
    private _groupInfos: IGroupInfo[];
    private _groupingService: GroupingService;

    // Cache for drag and drop (flat list modified by the current drag).
    private _ddList: IItemBase[];
    private _ddCurrentIndex: number;
    private _ddChildCount: number;

    private _childrenField = ItemListService.defaultChildrenField;

    // Cnacelable pre events
    private loadingItems$: (query: string | RegExp, selectedItems: IItemBase[]) => Observable<IItemBase[]>;
    private selectingItem$: (item: IItemBase) => Promise<IItemBase> | Observable<IItemBase>;
    private unselectingItem$: (item: IItemBase) => Promise<IItemBase> | Observable<IItemBase>;
    private expandingItem$: (item: IItemTree) => Promise<IItemTree> | Observable<IItemTree>;
    private collapsingItem$: (item: IItemTree) => Promise<IItemTree> | Observable<IItemTree>;

    // champs à utiliser comme valeur de comparaison
    private _valueField: string;

    /** Evalue la valeur à comparer pour l'élément spécifié.
     * @param value  Model à évaluer.
     * @param valueField (optional) Champs à traiter comme valeur.
     * @return Valeur à comparer pour le modèle spécifié.
     */
    public static getItemValue(item: any, valueField?: string) {
        // tslint:disable-next-line:triple-equals
        const isDefined = (value: any) => value != undefined;

        if (valueField) {
            const fields = valueField.split('.');
            let model = item.model && item.model[fields[0]] !== undefined ? item.model : item;
            fields.forEach((fieldName) => {
                model = model && model[fieldName];
            });
            if (isDefined(model)) {
                return typeof model === 'function' ? model() : model;
            }
        }

        return isDefined(item.value) ? item.value : (isDefined(item.model) ? item.model : item);
    }

    /** Evalue le texte à afficher pour l'élément spécifié.
     * @param value  Model à évaluer.
     * @param textField (optional) Champs à traiter comme source du texte.
     * @return Texte à afficher pour le modèle spécifié.
     */
    public static getItemText(value: any, textField?: string) {
        if (value) {
            if (textField) {
                const fields = textField.split('.');
                let model = value.model && value.model[fields[0]] !== undefined ? value.model : value;
                fields.forEach((fieldName) => {
                    model = model && model[fieldName];
                });
                if (model !== undefined) {
                    return typeof model === 'function' ? model() : model;
                }
                return '';
            }

            if (value.displayName) {
                return typeof value.displayName === 'string' ? value.displayName : value.displayName();
            } else if (typeof value.toString === 'function') {
                return value.toString();
            }
        }
        return '';
    }

    public get lastQuery() {
        return this._lastQuery;
    }

    /**
     * Set a observable called before the list will be displayed
     */
    public setLoadingItems(fn: (query: string | RegExp, selectedItems: IItemBase[]) => Observable<IItemBase[]>) {
        this.loadingItems$ = fn;
    }

    /**
     * Set a promise or an observable called before an item selection
     */
    public setSelectingItem(fn: (item: IItemBase) => Promise<IItemBase> | Observable<IItemBase>) {
        this.selectingItem$ = fn;
    }

    /**
     * Set a promise or an observable called before an item deselection
     */
    public setUnselectingItem(fn: (item: IItemBase) => Promise<IItemBase> | Observable<IItemBase>) {
        this.unselectingItem$ = fn;
    }

    /**
     * Set a promise or an observable called before an item expand
     */
    public setExpandingItem(fn: (item: IItemTree) => Promise<IItemTree> | Observable<IItemTree>) {
        this.expandingItem$ = fn;
    }

    /**
     * Set a promise or an observable called before an item collapse
     */
    public setCollapsingItem(fn: (item: IItemTree) => Promise<IItemTree> | Observable<IItemTree>) {
        this.collapsingItem$ = fn;
    }

    /**
     * Permet de controler l'affichage du waiter
     * @return un sujet contenant la valeur du waiter
     */
    public get waiter$(): BehaviorSubject<boolean> {
        return this._waiter$;
    }

    /** Définit le champs utilisé comme collection pour les enfants d'un parent.
     * @param value Nom du champ à utiliser comme collection d'enfants
     */
    public set childrenField(value: string) {
        this._childrenField = value || ItemListService.defaultChildrenField;
        this.invalidateCache();
    }

    /** Renvoie le champs utilisé comme collection pour les enfants d'un parent
     * @return value Nom du champ à utilisé comme collection d'enfants.
     */
    public get childrenField() {
        return this._childrenField;
    }

    /** Définit une valeur indiquant si les éléments selectionés doivent être masqué. Ce flag est principalement utilisé dans le cas d'un multi-select
     * @param value True si les éléments selectionés doivent être masqués
     */
    public set hideSelected(value: boolean) {
        this._hideSelected = value;
    }

    /** Renvoie une valeur indiquant si les éléments selectionés doivent être masqué.
     * @return value True si les éléments selectionés sont masqués
     */
    public get hideSelected() {
        return this._hideSelected;
    }

    /** Définit le champs à utiliser comme valeur de comparaison */
    public set valueField(valueField: string) {
        this._valueField = valueField;
    }

    /** Renvoie le champs à utiliser comme valeur de comparaison */
    public get valueField() {
        return this._valueField;
    }

    public get hasCache() {
        return this._cache && !!this._cache.visibleList;
    }

    private set items(items: IItemBase[]) {
        this._items = items;
        this.invalidateCache();
    }

    private get items() {
        return this._items;
    }

    /** Définit le modèle utilisé par la liste. Ce model peut ètre hierarchique sans limitation de la profondeur ou une chargé en asynchrone par une promise ou un observable.
     * @param items Provider de la liste des éléments de la liste.
     */
    public setItems$(items: any[] | Promise<any[]> | Observable<any[]>) {
        if (!items) {
            this.items = undefined;
            return observableOf(null);
        } else if (items instanceof Array) {
            this.ensureChildrenProperties(items);
            this.ensureSelectedItems(items);
            this.items = items;
            this._waiter$.next(false);
            return observableOf(items);
        } else {
            this.items = undefined;
            this._waiter$.next(true);
            let observable = items as Observable<IItemBase[]>;
            if (observable.subscribe === undefined) {
                const promise = items as Promise<IItemBase[]>;
                observable = observableFrom(promise);
            }

            return observable.pipe(
                map((its) => {
                    if (its) {
                        this.ensureChildrenProperties(its);
                        // TODO La déselection ne fonctionne pas pendant le chargement
                        this.ensureSelectedItems(its);
                        this.items = [...this.items || [], ...its];
                        this._waiter$.next(false);
                        return its;
                    } else {
                        this.items = [];
                        this._waiter$.next(false);
                        return [];
                    }
                }));
        }
    }

    public setModels$(items: any[] | Promise<any[]> | Observable<any[]>) {
        return this.setItems$(items);
    }

    /** Renvoie le modèle de grouping ajouté à la liste de base par le service. Ce modèle ne modifie pas la donée, mais est jsute ajouté à l'affichage
     * @return value Modèle de grouping d'affichage de la liste.
     */
    public get groupInfos() {
        return this._groupInfos;
    }

    // Ne pas utiliser, cette fonction retourne la liste des éléments pour l'implémentation de ngModel.
    public getItems() {
        return this.items;
    }

    /** Retourne l'élément corresondant à l'index spéficié dans la liste des éléments visibles.
     * @param index Index de l'élément à chercher sur la liste des éléments visibles.
     * @return Element correspondant à l'index recherché.
     */
    public getItemFromIndex(index: number) {
        return this._cache.visibleList ? this._cache.visibleList[index] : null;
    }

    /** Retourne l'index correspondant à l'élément spéficié dans la liste des éléments visibles
     * @param item Element à chercher sur la liste des éléments visibles.
     * @return Index correspondant à l'élément recherché.
     */
    public getItemIndex(item: IItemBase) {
        return this._cache.visibleList ? this._cache.visibleList.findIndex((itm) => this.compareItems(item, itm)) : -1;
    }

    /** Renvoie le service utilisé pour le tri de la liste
     * @return Service utilisé pour le tri.
     */
    public getSortingService() {
        if (!this._sortingService) {
            this._sortingService = new SortingService();
        }
        return this._sortingService;
    }

    /** Définit le service utilisé pour le tri de la liste
     * @param value  Service à utiliser pour le tri.
     */
    public setSortingService(value: SortingService) {
        this._sortingService = value;
    }

    /** Renvoie le service utilisé pour le regroupement de la liste
     * @return Service utilisé pour le regroupement.
     */
    public getGroupingService() {
        if (!this._groupingService) {
            this._groupingService = new GroupingService();
        }
        return this._groupingService;
    }

    /** Définit le service utilisé pour le regroupement de la liste
     * @param value Service à utiliser pour le regroupement.
     */
    public setGroupingService(value: GroupingService) {
        this._groupingService = value;
    }

    /** Evalue le texte à afficher pour l'élément spécifié.
     * @param value  Model à évaluer.
     * @param textField (optional) Champs à traiter comme source du texte.
     * @return Texte à afficher pour le modèle spécifié.
     */
    public getTextValue(value: any, textField?: string) {
        return ItemListService.getItemText(value, textField);
    }

    /** Evalue la valeur à comparer pour l'élément spécifié.
     * @param value  Model à évaluer.
     * @param valueField (optional) Champs à traiter comme valeur.
     * @return Valeur à comparer pour le modèle spécifié.
     */
    public getValue(item: any, valueField?: string) {
        return ItemListService.getItemValue(item, valueField);
    }

    /** Usage interne. Termine le drag and drop en cours. */
    public drop$(): Observable<boolean> {
        return new Observable<boolean>((subscriber: Subscriber<boolean>) => {
            if (!this._ddList || !this.items) {
                subscriber.next(false);
                return undefined;
            }

            const listIndex = this._ddCurrentIndex;
            const item = this._ddList[listIndex] as IItemTree;
            if (!item) {
                throw new Error('invalid drag infos stored in cache.');
            }

            // La drag and drop liste est incomplète, en cas de filtrage, retrouver l'élément juste en dessus dans la liste complète
            const targetItem = this._ddList[listIndex - 1] as IItemTree;
            let targetParent: IItemTree;

            // Find target in the flat list to calculate the correct index
            let flatListIndex = this._cache.flatList.findIndex((itm) => itm === targetItem);
            let targetIndex = 0;
            while (flatListIndex >= 0) {
                const parentItem = this._cache.flatList[flatListIndex] as IItemTree;
                if (parentItem.depth === undefined) {
                    // Flat list
                    targetIndex = flatListIndex;
                    break;
                } else if (parentItem.depth === item.depth - 1) {
                    targetParent = parentItem;
                    break;
                } else if (parentItem.depth === item.depth) {
                    ++targetIndex;
                }
                --flatListIndex;
            }

            const findItem = (itemToFind: IItemTree, treeList: IItemTree[]): IFindItemsResult => {
                for (let i = 0; i < treeList.length; i++) {
                    const itm = treeList[i];
                    if (itm === itemToFind) {
                        return {
                            index: i,
                            list: treeList,
                        };
                    } else if (itm.$items !== undefined) {
                        const result = findItem(itemToFind, itm.$items);
                        if (result) {
                            return result;
                        }
                    }
                }
            };

            const originResult = findItem(item, this.items);

            // Remove item from the origin
            originResult.list.splice(originResult.index, 1);

            // Add in the new location
            const targetList = targetParent ? targetParent.$items : this.items;

            if (targetIndex > originResult.index && originResult.list === targetList) {
                --targetIndex;
            }

            targetList.splice(targetIndex, 0, item);

            // Invalidate view cache
            this.invalidateCache();
            subscriber.next(true);
        });
    }

    /** Usage interne. Calcul l'élément cible d'un drag and drop en fonction de l'index spécifié. */
    public calcDragTargetIndex$(index: number, targetIndex: number): Observable<number> {
        return new Observable<number>((subscriber: Subscriber<number>) => {
            const currentList = this._ddList || this._cache.visibleList;

            if (!currentList) {
                throw new Error('Empty cache on calcDragTargetIndex');
            }

            const startIndex = this._ddCurrentIndex !== undefined ? this._ddCurrentIndex : index;
            if (startIndex >= currentList.length) {
                subscriber.next(currentList.length - 1);
                return undefined;
            }

            const item = currentList[startIndex] as IItemTree;
            const dragDropIndex = startIndex;

            if (item.depth !== undefined && targetIndex !== startIndex) {
                if (targetIndex < startIndex) {
                    // Remonte jusqu'au premier élément avec une profondeur plus grande
                    let beforeIndex = 0;
                    for (let b = startIndex - 1; b >= 0; b--) {
                        const targetItem = currentList[b] as IItemTree;
                        if (targetItem.depth <= item.depth) {
                            beforeIndex = b;
                            break;
                        }
                    }
                    if (targetIndex <= beforeIndex) {
                        // Descend jusqu'au premier élément avec la même profondeur
                        for (let a = targetIndex; a <= beforeIndex; a++) {
                            const targetItem = currentList[a] as IItemTree;
                            if (targetItem.depth === item.depth) {
                                subscriber.next(a);
                                return undefined;
                            } else if (targetItem.depth === item.depth - 1) {
                                subscriber.next(a + 1);
                                return undefined;
                            }
                        }
                    }
                }

                if (targetIndex > startIndex) {
                    // Descend jusqu'au premier élément avec une profondeur plus grande ou égale
                    let afterIndex = currentList.length - 1;
                    for (let a = startIndex + 1; a < currentList.length; a++) {
                        const targetItem = currentList[a] as IItemTree;
                        if (targetItem.depth <= item.depth) {
                            afterIndex = a;
                            break;
                        }
                    }
                    if (targetIndex >= afterIndex) {
                        // Descend jusqu'au premier élément avec la même profondeur
                        for (let a = targetIndex + 1; a < currentList.length; a++) {
                            const itm = currentList[a] as IItemTree;
                            if (itm.depth === item.depth) {
                                subscriber.next(a);
                                return undefined;
                            } else if (itm.depth === item.depth - 1) {
                                subscriber.next(a - 1);
                                return undefined;
                            }
                        }
                        // Not found
                        const targetItem = currentList[afterIndex] as IItemTree;
                        if (targetItem.depth === item.depth) {
                            subscriber.next(afterIndex);
                            return undefined;
                        }
                    }
                }
            }

            subscriber.next(dragDropIndex);
        });
    }

    /** Change l'état d'expansion de tous les éléments.
     * @param collapsed True si les éléments doivent être réduits.
     * @return Observable résolu par la fonction.
     */
    public toggleAll$(collapsed: boolean): Observable<IItemTree[]> {
        return observableOf(this._cache.flatList).pipe(
            map((items: IItemTree[]) => items.filter((item) => item.$items && item.collapsible !== false)),
            tap(() => delete this._cache.visibleList), // Invalidate view cache
            switchMap((items) => collapsed ? this.collapseItems$(items) : this.expandItems$(items)));
    }

    /** Change l'état d'expansion de l'élément spécifié par son index sur la liste des éléments visibles.
     * @param index Index sur la liste des éléments visibles de l'élément à changer.
     * @param collapse Etat de l'élément. True pour réduire l'élément.
     * @return Observable résolu par la fonction.
     */
    public toggleCollapse$(index: number, collapse?: boolean): Observable<IItemTree> {
        const visibleList = this._cache.visibleList;
        if (!visibleList || !visibleList.length) {
            throw new Error('Empty cache on toggleCollapse');
        }

        const item = visibleList[index] as IItemTree;
        if (!item || item.collapsible === false) {
            return observableOf([]);
        }

        const collapsed = collapse !== undefined ? collapse : item.collapsed ? false : true;
        return collapsed ? this.collapseItem$(item) : this.expandItem$(item);
    }

    /** Etends les éléments spécifiés.
     * @param items Liste des éléments à étendre.
     * @return Observable résolu par la fonction.
     */
    public expandItems$(items: IItemBase[]): Observable<IItemBase[]> {
        return observableFrom(items || []).pipe(
            switchMap((item) => this.expandItem$(item)),
            reduce((acc, cur) => [...acc, cur], []));
    }

    /** Reduits les éléments spécifiés.
     * @param items Liste des éléments à réduire.
     * @return Observable résolu par la fonction.
     */
    public collapseItems$(items: IItemBase[]): Observable<IItemBase[]> {
        return observableFrom(items || []).pipe(
            switchMap((item) => this.collapseItem$(item)),
            reduce((acc, cur) => [...acc, cur], []));
    }

    /** Etends l'élément spécifié.
     * @param items Eléments à étendre.
     * @return Observable résolu par la fonction.
     */
    public expandItem$(item: IItemTree) {
        return observableOf(item).pipe(
            filter((itm) => !!itm),
            switchMap((itm) => this.expandingItem$ ? this.expandingItem$(itm) : observableOf(itm)),
            filter((itm) => !!itm),
            tap((itm) => {
                itm.collapsed = false;
                // Invalidate view cache
                delete this._cache.visibleList;
            }));
    }

    /** Réduit l'élément spécifié.
     * @param items Eléments à réduire.
     * @return Observable résolu par la fonction.
     */
    public collapseItem$(item: IItemTree) {
        return observableOf(item).pipe(
            filter((itm) => !!itm),
            switchMap((itm) => this.collapsingItem$ ? this.collapsingItem$(itm) : observableOf(itm)),
            filter((itm) => !!itm),
            tap((itm) => {
                itm.collapsed = true;
                // Invalidate view cache
                delete this._cache.visibleList;
            }));
    }

    /** Retourne la liste des éléments sélectionés.
     * @return Liste des éléments selectionés.
     */
    public getSelectedItems() {
        return this.selectedList || [];
    }

    /** Définit la liste des éléments sélectionés.
     * @param items Liste des éléments a selectioner.
     */
    public setSelectedItems(items: IItemBase[]) {
        if (this.selectedList) {
            this.selectedList.forEach((item) => {
                item.selected = false;
            });
        }
        this.selectedList = items;
        if (this.hideSelected) {
            delete this._cache.visibleList;
        }

        this.ensureSelectedItems(this.items);
    }

    /** Déselectionne tous les éléments sélectionés.
     * @return Observable résolu par la fonction.
     */
    public unselectAll$(): Observable<IItemBase[]> {
        if (this.hideSelected) {
            delete this._cache.visibleList;
        }

        const selectedList = this.selectedList;
        this.selectedList = [];

        return this.unSelectItems$(selectedList);
    }

    /** Sélectionne une plage d'éléments en fonction de l'index de début et l'index de fin sur la liste des éléments visibles.
     * @param indexFrom index sur la liste des éléments visibles du premier élément à sélectioner.
     * @param indexTo index sur la liste des éléments visibles du dernier élément à sélectioner.
     * @return Observable résolu par la fonction.
     */
    public selectRange$(indexFrom: number, indexTo?: number): Observable<number> {
        if (indexTo === undefined) {
            indexTo = indexFrom;
        }

        // Backup current visible list in case of unselectAll clear the cache
        const visibleList = this._cache.visibleList;
        if (!visibleList || !visibleList.length) {
            throw new Error('Empty cache on selection');
        }

        return this.unselectAll$().pipe(
            map(() => visibleList.slice(Math.min(indexFrom, indexTo), 1 + Math.max(indexFrom, indexTo))),
            map((items) => items.filter((itm) => itm.selectable !== false)),
            tap(() => {
                if (this.hideSelected) {
                    delete this._cache.visibleList;
                }
            }),
            switchMap((items) => this.selectItems$(items).pipe(map((selected) => selected.length))));
    }

    /** Change l'état de selection de l'élément spécifié.
     * @param items Liste des éléments à modifier.
     * @param selected True si les éléments divent être sélectionés, False si ils doivent être déselectionés.
     * @return Observable résolu par la fonction.
     */
    public toggleSelect$(items: IItemBase[], selected: boolean) {
        items = items || [];
        return observableIif(() => selected, this.selectItems$(items), this.unSelectItems$(items)).pipe(
            map(() => {
                if (this.hideSelected) {
                    delete this._cache.visibleList;
                }
                return this.selectedList;
            }));
    }

    /** Sélectionne les éléments spécifiés
     * @param items Liste des éléments à sélectioner.
     * @return Observable résolu par la fonction.
     */
    public selectItems$(items: IItemBase[]): Observable<IItemBase[]> {
        return observableFrom(items || []).pipe(
            switchMap((item) => this.selectItem$(item)),
            reduce((acc: IItemBase[], cur: IItemBase) => [...acc, cur], []));
    }

    /** Déselectionne les éléments spécifiés
     * @param items Liste des éléments à déselectioner.
     * @return Observable résolu par la fonction.
     */
    public unSelectItems$(items: IItemBase[]): Observable<IItemBase[]> {
        return observableFrom(items || []).pipe(
            filter((item) => item.selected),
            switchMap((item) => this.unSelectItem$(item)),
            reduce((acc: IItemBase[], cur: IItemBase) => [...acc, cur], []));
    }

    /** Sélectionne l'élément spécifié
     * @param item Elément à sélectioner.
     * @return Observable résolu par la fonction.
     */
    public selectItem$(item: IItemBase) {
        return observableOf(item).pipe(
            filter((itm) => !!itm),
            switchMap((itm) => this.selectingItem$ ? this.selectingItem$(itm) : observableOf(itm)),
            filter((itm) => !!itm),
            tap((itm) => {
                if (!this.selectedList) {
                    this.selectedList = [];
                }

                itm.selected = true;
                this.selectedList.push(itm);
            }));
    }

    /** Déselectionne l'élément spécifié
     * @param item Elément à déselectioner.
     * @return Observable résolu par la fonction.
     */
    public unSelectItem$(item: IItemBase) {
        return observableOf(item).pipe(
            filter((itm) => !!itm),
            switchMap((itm) => this.unselectingItem$ ? this.unselectingItem$(itm) : observableOf(itm)),
            filter((itm) => !!itm),
            tap((itm) => {
                itm.selected = false;
                if (this.selectedList && this.selectedList.length) {
                    const index = this.selectedList.findIndex((i) => this.compareItems(i, itm));
                    if (index >= 0) {
                        this.selectedList.splice(index, 1);
                    }
                }
            }));
    }

    /** Trouve l'élément suivant répondant à la fonction de comparaison spécifiée.
     * @param compare Function de comparaison pour la recherche de l'élément.
     * @param startIndex Index de départ sur la liste des éléments visibles.
     * @return Observable résolu par la fonction.
     */
    public findNextMatch$(compare?: (item: IItemBase, index: number) => boolean, startIndex?: number): Observable<IFindItemResult> {
        let result = { index: -1 } as IFindItemResult;

        const list = this._cache.visibleList;
        if (!list || !list.length) {
            throw new Error('Empty cache on findNextMatch');
        }

        if (list.length) {
            if (startIndex < 0 || startIndex >= list.length) {
                startIndex = -1;
            }
            let idx = startIndex + 1;
            while (idx !== startIndex) {
                const itm = list[idx];
                if (compare(itm, idx)) {
                    result = {
                        index: idx,
                        item: itm,
                    } as IFindItemResult;
                    break;
                }
                idx++;
                if (idx >= list.length) {
                    if (startIndex === -1) {
                        break;
                    }
                    idx = 0;
                }
            }
        }
        return observableOf(result);
    }

    /** Trie les éléments en fonction du modèle de tri spécifié
     * @param sortInfos Modèle de tri à appliquer.
     * @return Observable résolu par la fonction.
     */
    public sort$(sortInfos: ISortInfos) {
        if (!this.items) {
            throw new Error('No Items');
        }

        const sortTree$ = this.getSortingService()
            .sortTree$(this._cache.groupedList, sortInfos, '$items').pipe(
                tap((sortedList: IItemTree[]) => {
                    this._cache.groupedList = sortedList;
                    this.invalidateViewCache();
                }));

        if (!this._cache.groupedList || this._cache.groupedList.length === 0) {
            return this.getGroupedList$(this.items).pipe(
                tap((groupedList) => this._cache.groupedList = groupedList),
                switchMap(() => sortTree$));
        } else {
            return sortTree$;
        }
    }

    /** Groupe les éléments en fonction du modèle de groupe spécifié
     * @param groupInfos Modèle de groupe à appliquer.
     * @return Observable résolu par la fonction.
     */
    public group$(groupInfos: IGroupInfo[]) {
        this._groupInfos = groupInfos;
        this.invalidateCache();
        this.ensureChildrenProperties(this.items);
        return observableOf(groupInfos);
    }

    /** Retire les groupe correspondants au modèle de groupe spécifié
     * @param groupInfos Modèle de groupe à retirer.
     * @return Observable résolu par la fonction.
     */
    public ungroup$(groupInfo: IGroupInfo) {
        const groupIndex = this._groupInfos ? this._groupInfos.findIndex((gi) => gi.groupByField === groupInfo.groupByField) : -1;
        if (groupIndex >= 0) {
            this._groupInfos.splice(groupIndex, 1);
        }

        this.invalidateCache();
        this.ensureChildrenProperties(this.items);
        return observableOf(groupInfo);
    }

    /** Retrouve les informations du parent de l'élément spécifié
     * @param item Element enfant du parent à retrouver.
     * @return Observable résolu par la fonction, qui retourne les informations sur le parent de l'élément spécifié
     */
    public getParentListInfos$(item: IItemTree, multiSelect: boolean): Observable<IParentListInfoResult> {
        const search$ = (flatList: IItemBase[]) => {
            let flatIndex = flatList.findIndex((itm) => itm === item);
            if (flatIndex < 0) {
                throw new Error('Item not found.');
            }

            let result: IParentListInfoResult;
            if (!item.depth) {
                const rootIndex = this.items.findIndex((itm) => itm === item);
                result = {
                    index: rootIndex,
                } as IParentListInfoResult;
            } else {
                // Search parent and treeindex
                let idx = 0;
                while (--flatIndex >= 0) {
                    const parentItem = flatList[flatIndex] as IItemTree;
                    if (parentItem.depth < item.depth) {
                        result = {
                            index: idx,
                            parent: parentItem,
                        } as IParentListInfoResult;
                    }
                    idx++;
                }
            }

            return observableOf(result);
        };

        return this.ensureFlatListCache$(true, multiSelect).pipe(
            switchMap(search$));
    }

    /** Supprime tous les caches internes. Ils seront recréés à la première demande de la portion de la liste à afficher. */
    public invalidateCache() {
        this._cache = {};
        this.ensureChildrenProperties(this.items);
    }

    /** Efface la hauteur calculée des lignes en mode automatique */
    public invalidateRowsHeightCache() {
        if (this._items) {
            this._items.forEach((item) => item.size = undefined);
        }
    }

    /** Usage interne. Retourne la portion de la liste à afficher en fonction des paramètres spécifiés. */
    public getViewList$(searchField: string, query?: RegExp | string, ignoreCache?: boolean, ddStartIndex?: number, ddTargetIndex?: number, multiSelect?: boolean): Observable<IViewListResult> {
        const result = {} as IViewListResult;

        const queryChanged = (query && query.toString()) !== (this._lastQuery && this._lastQuery.toString());
        ignoreCache = ignoreCache || queryChanged || !this.items || !this.items.length;
        this._lastQuery = query;

        const escapeChars = (text: string) => {
            const specialChars = ['\\', '/', '|', '&', ';', '$', '%', '@', '"', '<', '>', '(', ')', '+'];
            specialChars.forEach((c) => text = text.replace(c, `\\${c}`));
            return text;
        };

        // Check regexp validity
        // regExp.test(this.getTextValue(item));
        let regExp: RegExp;
        if (query) {
            if (typeof query === 'string') {
                try {
                    query = Diacritics.remove(query);
                    const escapedQuery = escapeChars(query);
                    regExp = new RegExp(escapedQuery, 'i');
                } catch (exc) {
                    console.log('Invalid search parameters');
                }
            } else {
                regExp = query as RegExp;
                if (regExp.test === undefined) {
                    regExp = undefined;
                }
            }
        }

        const loadViewList = () => {
            let viewList: IItemBase[];
            if (ddStartIndex !== undefined && ddTargetIndex !== undefined && ddStartIndex !== ddTargetIndex) {
                if (!this._ddList) {
                    // Generate a modified flat list for drag and drop Only
                    this._ddList = [...this._cache.visibleList];

                    // Calc child count to be dragged
                    const draggedItem = this._ddList[ddStartIndex] as IItemTree;
                    const parentDepth = draggedItem.depth;
                    let lastIndex = ddStartIndex;
                    if (parentDepth !== undefined) {
                        for (let i = ddStartIndex + 1; i < this._ddList.length; i++) {
                            const curItem = this._ddList[i] as IItemTree;
                            if (curItem.depth <= parentDepth) {
                                break;
                            }
                            lastIndex = i;
                        }
                    }
                    this._ddChildCount = lastIndex - ddStartIndex + 1;
                    this._ddCurrentIndex = ddStartIndex;
                }

                const removed = this._ddList.splice(this._ddCurrentIndex, this._ddChildCount);
                if (ddTargetIndex > this._ddCurrentIndex) {
                    ddTargetIndex -= this._ddChildCount;
                    ++ddTargetIndex;
                }
                this._ddCurrentIndex = ddTargetIndex;
                removed.forEach((itm) => this._ddList.splice(ddTargetIndex++, 0, itm));
                viewList = this._ddList;

            } else {
                delete this._ddList;
                delete this._ddCurrentIndex;
                delete this._ddChildCount;
                viewList = this._cache.visibleList || [];
            }

            result.depthMax = this._cache.depthMax;
            result.visibleList = viewList;

            return result;
        };

        if (ignoreCache) {
            // console.log('getItemList ' + Date.now());
            this.waiter$.next(true);

            if (queryChanged || !this.items || !this.items.length) {
                this.internalQuery = regExp;
            }

            return this.getItemList$(query, this.selectedList).pipe(
                tap((items) => {
                    if (!this.items || !this.items.length) {
                        this.ensureSelectedItems(items);
                    }

                    if (items !== this.items) {
                        // New item list, invalidate view cache
                        this.items = items;
                        // Be cause a new array was returned by getItemList, the list is considered as already filtered (Lazy loading)
                        this.internalQuery = undefined;
                        this.ensureChildrenProperties(items);
                    }

                    delete this._cache.visibleList;
                    this.waiter$.next(this.items === undefined);
                }),
                switchMap(() => this.ensureVisibleListCache$(searchField, this.internalQuery, queryChanged, multiSelect)),
                map(loadViewList));
        } else {
            return this.ensureVisibleListCache$(searchField, this.internalQuery, queryChanged, multiSelect).pipe(
                map(loadViewList));
        }
    }

    public ensureSelection() {
        return this.ensureSelectedItems(this.items);
    }

    /** Retourne la liste à utilise pour la création des caches. Surcharger cetee méthode pour fournir une liste de façon lazy.
     * En cas de surcharge, retourner une nouvelle instance de la liste originale pour que le service regénère ses caches.
     * @param query Texte ou regular expression par laquelle la liste doit être filtrée.
     * @param selectedItems Liste des éléments selectionés.
     * @return Observable résolu par la fonction, qui retourne la liste à utiliser.
     */
    protected getItemList$(query?: RegExp | string, selectedItems?: IItemBase[]): Observable<IItemBase[]> {
        return this.loadingItems$ ? this.loadingItems$(query, selectedItems) : observableOf(this.items);
    }

    /** Retourne une valeur indiquant si l'élément spécifié correspond aux critères de recherche spécifiés
     * @param item Elément à analyser.
     * @param searchField Nom du champ à utiliser pour la recherche. Le champ représenté peut-être une valeur ou une function.
     * @param regExp Expression de test sur le champs spécifié.
     * @return True si l'élément correspond aux critères de recherche.
     */
    protected itemMatch(item: IItemBase, searchField: string, regExp: RegExp) {
        const itmTree = (item as IItemTree);
        if (itmTree.$items) {
            return true;
        }
        const field = (<any>item)[searchField];
        const value = typeof field === 'function' ? field() : (field ? field : this.getTextValue(item, searchField));
        return value && regExp.test(Diacritics.remove(value));
    }

    /** Retourne une liste groupée si un modèle de groupe interne est spécifié.
     * En cas de surcharge, retourner une nouvelle instance de la liste originale pour que le service regénère ses caches.
     * @param items Liste des éléments à grouper.
     * @return Observable résolu par la fonction, qui retourne la liste groupés.
     */
    protected getGroupedList$(items: IItemBase[]): Observable<IItemTree[]> {
        return items ? this.getGroupingService().group$(this.items, this.groupInfos, '$items') : observableOf([]);
    }

    /** Retourne la liste des éléments visibles. Si la liste des éléments est hièrarchique, cette fonction retourne une liste plate. Cette liste est utilisé pour calculer la portion de la liste à afficher.
     * En cas de surcharge, retourner une nouvelle instance de la liste originale pour que le service regénère ses caches.
     * @param items Liste des éléments à traiter.
     * @param searchField Nom du champ à utiliser pour la recherche. Le champ représenté peut-être une valeur ou une function.
     * @param regExp Expression de test à appliquer sur le champ de recherche.
     * @param Auto expand parents on search query.
     * @return Observable résolu par la fonction, qui retourne la liste visibles.
     */
    protected getVisibleList$(items: IItemBase[], searchField: string, regExp: RegExp, expandTree: boolean, multiSelect: boolean): Observable<IItemBase[]> {
        if (!items) {
            return observableOf([]);
        }

        let visibleList = [] as IItemTree[];
        const selectedList = [] as IItemBase[];
        let odd = false;

        if (regExp) {
            // Recalc visible list and select list from the filter
            const getFilteredList = (treeList: IItemBase[], depth: number, hidden: boolean) => {
                let filteredItems: IItemBase[];
                if (treeList) {
                    treeList.forEach((itm) => {
                        const itmTree = (itm as IItemTree);
                        if (itmTree.$items) {
                            if (itmTree.visible !== false && this.itemMatch(itmTree, searchField, regExp)) {
                                odd = false;
                                const filteredChildren = getFilteredList(itmTree.$items, depth + 1, hidden);
                                if (filteredChildren) {
                                    if (itmTree.collapsed && expandTree) {
                                        itmTree.collapsed = false;
                                    }
                                    filteredItems = !filteredItems ? (itmTree.collapsed ? [itmTree] : [itmTree, ...filteredChildren]) : (itmTree.collapsed ? [...filteredItems, itmTree] : [...filteredItems, itmTree, ...filteredChildren]);
                                    if (itmTree.selected) {
                                        selectedList.push(itmTree);
                                    }
                                }
                            }

                            // compare fn can be something like re.test(this.getTextValue(itm)
                        } else if (this.itemMatch(itm, searchField, regExp)) {
                            itmTree.depth = depth;
                            if (!filteredItems) {
                                filteredItems = [];
                            }
                            if (!hidden && !(itm.visible === false) && !(itm.selected && this.hideSelected)) {
                                // For style
                                itmTree.odd = odd;
                                odd = !odd;

                                filteredItems.push(itmTree);
                            }
                            if (itmTree.selected) {
                                selectedList.push(itmTree);
                            }
                        } else if (itmTree.selected) {
                            selectedList.push(itmTree);
                        }
                    });
                }

                return filteredItems;
            };

            visibleList = getFilteredList(items || [], 0, false) || [];

        } else {
            // Get visible items list without filter
            const getVisibleListInternal = (treeList: IItemTree[], depth: number, hidden: boolean) => {
                if (treeList) {
                    treeList.forEach((item) => {
                        if (!hidden && !(item.visible === false) && !(item.selected && this.hideSelected)) {
                            // For style
                            item.odd = odd;
                            odd = !odd;

                            // Add to visible list only the visible items (uncollapsed)
                            visibleList.push(item);
                        }

                        // Add to selected list only the visible items (uncollapsed) and selected
                        if (item.selected) {
                            selectedList.push(item);
                        }

                        // Recursive call
                        if (item.$items) {
                            odd = false;
                            getVisibleListInternal(item.$items, depth + 1, hidden || item.collapsed || item.visible === false);
                        }
                    });
                }
            };

            getVisibleListInternal(items, 0, false);
        }

        return observableOf(visibleList).pipe(
            tap(() => {
                if (!multiSelect) {
                    this.selectedList = selectedList;
                }
            }));
    }

    /** Retourne une liste plate depuis la liste originale sans hierarchie.
     * En cas de surcharge, retourner une nouvelle instance de la liste originale pour que le service regénère ses caches.
     * @param items Liste des éléments hierarchique.
     * @return Observable résolu par la fonction, qui retourne la liste hierarchique mise à plat.
     */
    protected getFlatList$(items: IItemBase[], isFiltered: boolean, multiSelect: boolean): Observable<IItemBase[]> {
        if (!items) {
            return observableOf([]);
        }

        const visibleList = [] as IItemBase[];
        const selectedList = [] as IItemBase[];
        let depthMax = 0;
        let isTree = false;
        let odd = false;

        const flatList$: any = (itms: IItemTree[], depth: number, hidden: boolean) => {
            return observableFrom(itms || []).pipe(
                tap((item) => {
                    if (depth > depthMax) {
                        depthMax = depth;
                    }

                    // Fill system properties
                    item.depth = depth;

                    if (!hidden && !(item.visible === false) && !(item.selected && this.hideSelected)) {
                        // For style
                        item.odd = odd;
                        odd = !odd;

                        // Add to visible list only the visible items (uncollapsed)
                        visibleList.push(item);
                    }

                    // Add to selected list only the visible items (uncollapsed) and selected
                    if (item.selected) {
                        selectedList.push(item);
                    }
                }),
                switchMap((item) => {
                    if (item.$items) {
                        isTree = true;
                        odd = false;
                        return observableConcat(observableOf(item), flatList$(item.$items, depth + 1, hidden || item.collapsed));
                    } else {
                        return observableOf(item);
                    }
                }));
        };

        return flatList$(items, 0, false).pipe(
            tap(() => {
                if (!multiSelect) {
                    this.selectedList = selectedList;
                }

                if (!isFiltered) {
                    this._cache.visibleList = visibleList;
                }
                this._cache.depthMax = isTree ? depthMax : 0;
            }),
            reduce((acc: any[], cur: IItemBase) => {
                acc.push(cur);
                return acc;
            }, []));
    }

    /** Efface une partie des caches  */
    protected invalidateViewCache() {
        delete this._cache.flatList;
        delete this._cache.visibleList;
        delete this._cache.depthMax;
        this._cache.rowsCount = 0;
    }

    private ensureSelectedItems(items: IItemBase[]) {
        if (this.selectedList && this.selectedList.length > 0) {
            // Ensure selected flag
            this.selectedList.forEach((item) => item.selected = true);

            if (!items) {
                return this.selectedList;
            }

            const newSelectedList = [] as IItemBase[];
            const ensureSelectedChildren = (children: IItemTree[]) => {
                children.forEach((item) => {
                    const selectedItem = this.selectedList.find((selected) => this.compareItems(selected, item));
                    if (selectedItem) {
                        selectedItem.selected = false;
                        newSelectedList.push(item);
                    }
                    if (item.$items) {
                        ensureSelectedChildren(item.$items);
                    }
                });
            };

            ensureSelectedChildren(items);

            // Add not found selected items
            this.selectedList.filter((item) => item.selected).forEach((item) => newSelectedList.push(item));

            this.selectedList = newSelectedList;

            // Ensure selected flag for the new items
            this.selectedList.forEach((item) => item.selected = true);

        } else {
            this.selectedList = [];

            if (!items) {
                return this.selectedList;
            }

            const ensureSelectedChildren = (children: IItemTree[]) => {
                children.forEach((item) => {
                    if (item.selected) {
                        this.selectedList.push(item);
                    }
                    if (item.$items) {
                        ensureSelectedChildren(item.$items);
                    }
                });
            };

            ensureSelectedChildren(items);
        }

        return this.selectedList;
    }

    private compareItems = (item1: IItemBase, item2: IItemBase) => {
        // tslint:disable-next-line:triple-equals
        const isDefined = (value: any) => value != undefined;

        if (!isDefined(item1) || !isDefined(item2)) {
            return false;
        } else if (isDefined(item1) && !isDefined(item2)) {
            return false;
        } else if (!isDefined(item1) && isDefined(item2)) {
            return false;
        } else {
            if (item1.equals) {
                return item1.equals(item2);
            } else if (item2.equals) {
                return item2.equals(item1);
            } else if (item1.model && item1.model.equals) {
                return item1.model.equals(item2.model);
            } else if (item2.model && item2.model.equals) {
                return item2.model.equals(item1.model);
            } else {
                return this.getValue(item1, this._valueField) === this.getValue(item2, this._valueField);
            }
        }
    }

    private ensureVisibleListCache$(searchField: string, regExp: RegExp, expandTree: boolean, multiSelect: boolean) {
        if (this._cache.visibleList && this._cache.visibleList.length) {
            return observableOf(this._cache.visibleList);
        } else {
            return this.ensureFlatListCache$(!!regExp, multiSelect).pipe(
                switchMap(() => this.getVisibleList$(this._cache.groupedList, searchField, regExp, expandTree, multiSelect)),
                tap((visibleList) => {
                    /* if (this._cache.visibleList && this._cache.visibleList.length && this._cache.visibleList !== visibleList) {
                     // New visible list
                     // Nothing to do yet
                     }*/

                    this._cache.visibleList = visibleList;
                    this._cache.rowsCount = visibleList.length;
                }));
        }
    }

    private ensureFlatListCache$(isFiltered: boolean, multiSelect: boolean) {
        if (this._cache.flatList && this._cache.flatList.length) {
            return observableOf(this._cache.flatList);
        } else {
            return this.ensureGroupedListCache$().pipe(
                switchMap(() => this.getFlatList$(this._cache.groupedList, isFiltered, multiSelect)),
                tap((flatList) => {
                    if (this._cache.flatList && this._cache.flatList.length && this._cache.flatList !== flatList) {
                        // New flat list
                        delete this._cache.visibleList;
                        this._cache.rowsCount = 0;

                        // Ensure depth max
                        this._cache.depthMax = 0;
                        if (flatList) {
                            flatList.forEach((item: IItemTree) => {
                                if (item.depth && item.depth > this._cache.depthMax) {
                                    this._cache.depthMax = item.depth;
                                }
                            });
                        }
                    }
                    this._cache.flatList = flatList;
                }));
        }
    }

    private ensureGroupedListCache$() {
        if (this._cache.groupedList && this._cache.groupedList.length) {
            return observableOf(this._cache.groupedList);
        } else if (!this.groupInfos || this.groupInfos.length === 0) {
            return observableOf(this.items).pipe(
                tap((items) => this._cache.groupedList = items));
        } else if (this.items) {
            return this.getGroupedList$(this.items).pipe(
                tap((groupedList) => {
                    if (this._cache.groupedList && this._cache.groupedList.length && this._cache.groupedList !== groupedList) {
                        // New grouped list
                        this.invalidateViewCache();
                    }
                    this._cache.groupedList = groupedList;
                }));
        } else {
            return observableOf([]);
        }
    }

    private ensureChildrenProperties(items: IItemTree[]) {
        if (!items) {
            return;
        }

        items.forEach((item) => {
            const field = (<any>item)[this.childrenField];
            if (field) {
                item.$items = field;
                this.ensureChildrenProperties(item.$items);
            }
        });
    }
}

/** Structure de retour de getViewList. */
export interface IViewListResult {
    depthMax?: number;
    visibleList?: IItemBase[];
}

/** Structure de retour de findNextMatch. */
export interface IFindItemResult {
    /** Elément trouvé. */
    item: IItemBase;
    /** Index de l'élément dans la liste des éléments visibles. */
    index: number;
}

/** Structure de retour de getParentListInfos. */
export interface IParentListInfoResult {
    /** Elément parent. */
    parent?: IItemTree;
    /** Index de l'élément enfant dans la liste des enfants du parent. */
    index: number;
}

interface IFindItemsResult {
    list: IItemBase[];
    index: number;
}
