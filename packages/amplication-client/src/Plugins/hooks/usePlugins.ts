import { QueryOptions, useMutation, useQuery } from "@apollo/client";
import {
  GET_PLUGIN_INSTALLATIONS,
  CREATE_PLUGIN_INSTALLATION,
  UPDATE_PLUGIN_INSTALLATION,
  GET_PLUGIN_ORDER,
  UPDATE_PLUGIN_ORDER,
  GET_PLUGIN_INSTALLATION,
} from "../queries/pluginsQueries";
import * as models from "../../models";
import { keyBy } from "lodash";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../context/appContext";

export type PluginVersion = {
  version: string;
  settings: { [key: string]: any };
};

export type Plugin = {
  id: string;
  name: string;
  description: string;
  repo: string;
  npm: string;
  icon: string;
  github: string;
  website: string;
  category: string;
  type: string;
  versions: PluginVersion[];
};

export type OnPluginDropped = (
  dragItem: models.PluginInstallation,
  hoverItem: models.PluginInstallation
) => void;

const PLUGINS: Plugin[] = [
  {
    id: "db-postgres",
    description:
      "Use a PostgreSQL database in the service generated by Amplication",
    icon: "icons/db-postgres.png",
    name: "PostgreSQL DB",
    repo:
      "https://github.com/amplication/plugins/tree/master/plugins/db-postgres",
    npm: "@amplication/plugin-db-postgres",
    github: "test",
    website: "test",
    category: "test",
    type: "test",
    versions: [
      {
        version: "0.0.1",
        settings: {
          enableLogging: true,
          defaultPort: "5432",
        },
      },
      {
        version: "0.0.2",
        settings: {
          enableLogging: true,
          defaultPort: "5432",
        },
      },
    ],
  },
  {
    id: "db-mysql",
    description: "Use a MySQL database in the service generated by Amplication",
    icon: "icons/db-mysql.png",
    name: "MySQL DB",
    repo: "https://github.com/amplication/plugins/tree/master/plugins/db-mysql",
    npm: "@amplication/plugin-db-mysql",
    github: "test",
    website: "test",
    category: "test",
    type: "test",
    versions: [
      {
        version: "latest",
        settings: {},
      },
    ],
  },
  {
    id: "broker-kafka",
    description:
      "Use a Kafka message broker to communicate between your services",
    icon: "icons/kafka.png",
    name: "Kafka",
    repo:
      "https://github.com/amplication/plugins/tree/master/plugins/broker-kafka",
    npm: "@amplication/plugin-broker-kafka",
    github: "test",
    website: "test",
    category: "test",
    type: "test",
    versions: [
      {
        version: "latest",
        settings: {},
      },
    ],
  },

  {
    id: "auth-jwt",
    description:
      "A Passport strategy for authenticating with a JSON Web Token (JWT).",
    icon: "icons/auth-jwt.png",
    name: "Passport JWT Authentication",
    repo: "https://github.com/amplication/plugins/tree/master/plugins/auth-jwt",
    npm: "@amplication/plugin-auth-jwt",
    github: "test",
    website: "test",
    category: "test",
    type: "test",
    versions: [
      {
        version: "latest",
        settings: {},
      },
    ],
  },
  {
    id: "auth-basic",
    description:
      "A Passport strategy for authenticating using the standard basic HTTP scheme.",
    icon: "icons/auth-basic.png",
    name: "Passport Basic Authentication",
    repo:
      "https://github.com/amplication/plugins/tree/master/plugins/auth-basic",
    npm: "@amplication/plugin-auth-basic",
    github: "test",
    website: "test",
    category: "test",
    type: "test",
    versions: [
      {
        version: "latest",
        settings: {},
      },
    ],
  },
];

const setPluginOrderMap = (pluginOrder: models.PluginOrderItem[]) => {
  return pluginOrder.reduce(
    (
      pluginOrderObj: { [key: string]: number },
      plugin: models.PluginOrderItem
    ) => {
      pluginOrderObj[plugin.pluginId] = plugin.order;

      return pluginOrderObj;
    },
    {}
  );
};

const usePlugins = (resourceId: string, pluginInstallationId?: string) => {
  const [pluginOrderObj, setPluginOrderObj] = useState<{
    [key: string]: number;
  }>();
  const { addBlock } = useContext(AppContext);

  const {
    data: pluginInstallations,
    loading: loadingPluginInstallations,
    error: errorPluginInstallations,
  } = useQuery<{
    PluginInstallations: models.PluginInstallation[];
  }>(GET_PLUGIN_INSTALLATIONS, {
    variables: {
      resourceId: resourceId,
    },
  });

  const {
    data: pluginInstallation,
    loading: loadingPluginInstallation,
    error: errorPluginInstallation,
  } = useQuery<{
    PluginInstallation: models.PluginInstallation;
  }>(GET_PLUGIN_INSTALLATION, {
    skip: !pluginInstallationId,
    variables: {
      pluginId: pluginInstallationId,
    },
  });

  const {
    data: pluginOrder,
    loading: loadingPluginOrder,
    error: pluginOrderError,
  } = useQuery<{ pluginOrder: models.PluginOrder }>(GET_PLUGIN_ORDER, {
    variables: {
      resourceId: resourceId,
    },
  });

  useEffect(() => {
    if (!pluginOrder || loadingPluginOrder) return;

    const setPluginOrder = setPluginOrderMap(pluginOrder?.pluginOrder.order);
    setPluginOrderObj(setPluginOrder);
  }, [pluginOrder, loadingPluginOrder]);

  useEffect(() => {
    if (pluginOrderError) {
      setPluginOrderObj({});
    }
  }, [pluginOrderError]);

  const pluginCatalog = useMemo(() => {
    return keyBy(PLUGINS, (plugin) => plugin.id);
  }, []);

  const sortedPluginInstallation = useMemo(() => {
    if (!pluginOrder || !pluginInstallations) return undefined;

    const pluginOrderArr = [...pluginOrder?.pluginOrder.order];

    return (pluginOrderArr.map((plugin: models.PluginOrderItem) => {
      return pluginInstallations?.PluginInstallations.find(
        (installationPlugin: models.PluginInstallation) =>
          installationPlugin.pluginId === plugin.pluginId
      );
    }) as unknown) as models.PluginInstallation[];
  }, [pluginInstallations, pluginOrder]);

  const [updatePluginOrder, { error: UpdatePluginOrderError }] = useMutation<{
    setPluginOrder: models.PluginOrder;
  }>(UPDATE_PLUGIN_ORDER, {
    onCompleted: (data) => {
      addBlock(data.setPluginOrder.id);
    },
    refetchQueries: [
      {
        query: GET_PLUGIN_ORDER,
        variables: {
          resourceId: resourceId,
        },
      },
    ],
  });

  const [updatePluginInstallation, { error: updateError }] = useMutation<{
    updatePluginInstallation: models.PluginInstallation;
  }>(UPDATE_PLUGIN_INSTALLATION, {
    onCompleted: (data) => {
      addBlock(data.updatePluginInstallation.id);
    },
    refetchQueries: () => {
      const queries: QueryOptions[] = [
        {
          query: GET_PLUGIN_INSTALLATIONS,
          variables: {
            resourceId: resourceId,
          },
        },
        {
          query: GET_PLUGIN_ORDER,
          variables: {
            resourceId: resourceId,
          },
        },
      ];

      if (pluginInstallationId) {
        queries.push({
          query: GET_PLUGIN_INSTALLATION,
          variables: {
            pluginId: pluginInstallationId,
          },
        });
      }
      return queries;
    },
  });

  const [createPluginInstallation, { error: createError }] = useMutation<{
    createPluginInstallation: models.PluginInstallation;
  }>(CREATE_PLUGIN_INSTALLATION, {
    onCompleted: (data) => {
      addBlock(data.createPluginInstallation.id);
    },
    refetchQueries: [
      {
        query: GET_PLUGIN_INSTALLATIONS,
        variables: {
          resourceId: resourceId,
        },
      },
      {
        query: GET_PLUGIN_ORDER,
        variables: {
          resourceId: resourceId,
        },
      },
    ],
  });

  const onPluginDropped = useCallback(
    (
      dragPlugin: models.PluginInstallation,
      hoverPlugin: models.PluginInstallation
    ) => {
      console.log(dragPlugin, hoverPlugin);
    },
    []
  );

  return {
    pluginInstallations: sortedPluginInstallation,
    loadingPluginInstallations,
    errorPluginInstallations,
    pluginInstallation,
    loadingPluginInstallation,
    errorPluginInstallation,
    updatePluginInstallation,
    updateError,
    createPluginInstallation,
    createError,
    pluginCatalog,
    onPluginDropped,
    pluginOrderObj,
    updatePluginOrder,
    UpdatePluginOrderError,
  };
};

export default usePlugins;
