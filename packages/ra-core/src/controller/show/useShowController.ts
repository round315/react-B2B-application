import { useParams } from 'react-router-dom';
import useVersion from '../useVersion';
import { Record, Identifier, OnFailure } from '../../types';
import { useGetOne, Refetch } from '../../dataProvider';
import { useTranslate } from '../../i18n';
import { useNotify, useRedirect, useRefresh } from '../../sideEffect';
import { CRUD_GET_ONE } from '../../actions';
import { useResourceContext, useGetResourceLabel } from '../../core';

/**
 * Prepare data for the Show view.
 *
 * useShowController does a few things:
 * - it grabs the id from the URL and the resource name from the ResourceContext,
 * - it fetches the record via useGetOne,
 * - it prepares the page title.
 *
 * @param {Object} props The props passed to the Show component.
 *
 * @return {Object} controllerProps Fetched data and callbacks for the Show view
 *
 * @example
 *
 * import { useShowController } from 'react-admin';
 * import ShowView from './ShowView';
 *
 * const MyShow = () => {
 *     const controllerProps = useShowController();
 *     return <ShowView {...controllerProps} />;
 * };
 *
 * @example // useShowController can also take its parameters from props
 *
 * import { useShowController } from 'react-admin';
 * import ShowView from './ShowView';
 *
 * const MyShow = () => {
 *     const controllerProps = useShowController({ resource: 'posts', id: 1234 });
 *     return <ShowView {...controllerProps} />;
 * };
 */
export const useShowController = <RecordType extends Record = Record>(
    props: ShowControllerProps = {}
): ShowControllerResult<RecordType> => {
    const { id: propsId, onFailure } = props;
    const resource = useResourceContext(props);
    const translate = useTranslate();
    const notify = useNotify();
    const redirect = useRedirect();
    const refresh = useRefresh();
    const version = useVersion();
    const { id: routeId } = useParams<{ id?: string }>();
    const id = propsId || decodeURIComponent(routeId);

    const { data: record, error, loading, loaded, refetch } = useGetOne<
        RecordType
    >(resource, id, {
        action: CRUD_GET_ONE,
        onFailure:
            onFailure ??
            (() => {
                notify('ra.notification.item_doesnt_exist', {
                    type: 'warning',
                });
                redirect('list', resource);
                refresh();
            }),
    });

    const getResourceLabel = useGetResourceLabel();
    const defaultTitle = translate('ra.page.show', {
        name: getResourceLabel(resource, 1),
        id,
        record,
    });

    return {
        defaultTitle,
        error,
        loaded,
        loading,
        record,
        refetch,
        resource,
        version,
    };
};

export interface ShowControllerProps {
    id?: Identifier;
    onFailure?: OnFailure;
    resource?: string;
}

export interface ShowControllerResult<RecordType extends Record = Record> {
    defaultTitle: string;
    // Necessary for actions (EditActions) which expect a data prop containing the record
    // @deprecated - to be removed in 4.0d
    data?: RecordType;
    error?: any;
    loading: boolean;
    loaded: boolean;
    resource: string;
    record?: RecordType;
    refetch: Refetch;
    version: number;
}